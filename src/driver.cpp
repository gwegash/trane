// A lot of this is taken (gratefully) from https://github.com/ianthehenry/toodle.studio
#include <emscripten.h>
#include <emscripten/bind.h>
#include <string>
#include <stdio.h>
#include "janet.h"

using std::string;

static JanetFunction *janetfn_evaluate = NULL;
static JanetFunction *janetfn_run = NULL;
static JanetFunction *janetfn_print_instruments = NULL;
static JanetFunction *janetfn_print_loops = NULL;

Janet env_lookup(JanetTable *env, const char *name) {
    Janet out;
    janet_resolve(env, janet_csymbol(name), &out);
    return out;
}

JanetFunction *env_lookup_function(JanetTable *env, const char *name) {
    Janet value = env_lookup(env, name);
    if (!janet_checktype(value, JANET_FUNCTION)) {
        janet_panicf("expected %s to be a function, got %q\n", name, value);
    }
    return janet_unwrap_function(value);
}

JanetTable *env_lookup_table(JanetTable *env, const char *name) {
    Janet value = env_lookup(env, name);
    if (!janet_checktype(value, JANET_TABLE)) {
        janet_panicf("expected %s to be a table, got %q\n", name, value);
    }
    return janet_unwrap_table(value);
}

bool call_fn(JanetFunction *fn, int argc, const Janet *argv, Janet *out) {
    JanetFiber *fiber = NULL;
    if (janet_pcall(fn, argc, argv, out, &fiber) == JANET_SIGNAL_OK) {
        return true;
    } else {
        janet_stacktrace(fiber, *out);
        return false;
    }
}

// TODO fractional time

struct Note {
    int32_t channel;
    double pitch;
    double vel;
    double start;
    double dur;
};

struct Instrument {
    int32_t channel;
    string name;
    std::vector<string> args; //arguments used to set parameters on instruments at compile time. (Ie this sample or samples)
};

struct CompileResult {
    bool is_error;
    string error;
    uintptr_t image;
};

struct StartResult {
    /* TODO: also background color, fade info? */
    uintptr_t environment;
    std::vector<string> lloop_names;
    std::vector<Instrument> instrument_mappings;
    double bpm;
};

struct ContinueResult {
    bool is_error;
    string error;
    std::vector<Note> notes;
    double rest_length;
};

CompileResult compilation_error(string message) {
    return (CompileResult) {
        .is_error = true,
            .error = message,
            .image = NULL,
    };
}

ContinueResult continue_error(string message) {
    return (ContinueResult) {
        .is_error = true,
            .error = message,
            .notes = std::vector<Note>(),
            .rest_length = 0.0,
    };
}

void retain_environment(uintptr_t environment_ptr) {
    janet_gcroot(janet_wrap_table(reinterpret_cast<JanetTable *>(environment_ptr)));
}
void release_environment(uintptr_t environment_ptr) {
    janet_gcunroot(janet_wrap_table(reinterpret_cast<JanetTable *>(environment_ptr)));
}

void retain_image(uintptr_t image_ptr) {
    janet_gcroot(janet_wrap_buffer(reinterpret_cast<JanetBuffer *>(image_ptr)));
}
void release_image(uintptr_t image_ptr) {
    janet_gcunroot(janet_wrap_buffer(reinterpret_cast<JanetBuffer *>(image_ptr)));
}

CompileResult trane_compile(string source) {
    if (janetfn_evaluate == NULL) {
        fprintf(stderr, "unable to initialize evaluator\n");
        return compilation_error("function uninitialized");
    }

    Janet environment;
    const Janet args[1] = { janet_cstringv(source.c_str()) };
    if (!call_fn(janetfn_evaluate, 1, args, &environment)) {
        return compilation_error("compilation error");
    }

    JanetTable *reverse_lookup = env_lookup_table(janet_core_env(NULL), "make-image-dict");
    JanetBuffer *image = janet_buffer(2 << 8);
    janet_marshal(image, environment, reverse_lookup, 0);

    janet_gcroot(janet_wrap_buffer(image));
    return (CompileResult) {
        .is_error = false,
            .error = "",
            .image = reinterpret_cast<uintptr_t>(image),
    };
}

StartResult trane_start(uintptr_t image_ptr) {
    JanetBuffer *image = reinterpret_cast<JanetBuffer *>(image_ptr);
    JanetTable *lookup = env_lookup_table(janet_core_env(NULL), "load-image-dict");
    Janet environment = janet_unmarshal(image->data, image->count, 0, lookup, NULL);
    if (!janet_checktype(environment, JANET_TABLE)) {
        janet_panicf("%q is not an environment table", environment);
    }

    const Janet args[1] = { environment };

    janet_gcroot(environment);
    JanetTable * envTable = janet_unwrap_table(environment);
    Janet lloopsTable = janet_table_get(envTable, janet_ckeywordv("lloops"));

    const Janet tableArgs[1] = { lloopsTable };

    //
    //grab lloop names
    Janet keys_result;

    janet_gcroot(keys_result);
    call_fn(janetfn_print_loops, 1, tableArgs, &keys_result);
    janet_gcunroot(keys_result);

    JanetArray * keys_unparsed = janet_unwrap_array(keys_result);

    int32_t count = keys_unparsed->count;

    auto keys_vec = std::vector<string>();

    for (int32_t i = 0; i < count; i++) {
        const string lloop_name = reinterpret_cast<const char *> janet_unwrap_string(keys_unparsed->data[i]);
        keys_vec.push_back(lloop_name);
    }

    //Grab the bpm
    const Janet janetBpm = janet_table_get(envTable, janet_ckeywordv("bpm"));
    janet_gcroot(janetBpm);
    double bpm = janet_unwrap_number(janetBpm);
    janet_gcunroot(janetBpm);

    //
    //grab instrument mappings
    Janet instruments_table = janet_table_get(envTable, janet_ckeywordv("instruments"));

    const Janet kvsArgs[1] = { instruments_table };

    Janet kvs_result;

    janet_gcroot(kvs_result);
    call_fn(janetfn_print_instruments, 1, kvsArgs, &kvs_result);
    janet_gcunroot(kvs_result);

    JanetArray * instruments_unparsed = janet_unwrap_array(kvs_result);

    int32_t instruments_count = instruments_unparsed->count / 2; //KVS comes in pairs of key, val so we divide by 2

    auto instruments_vec = std::vector<Instrument>();

    for (int32_t i = 0; i < instruments_count; i++) {
        const string instrument_name = reinterpret_cast<const char *> janet_unwrap_string(instruments_unparsed->data[i*2]);

        JanetArray * instrument_params_unparsed = janet_unwrap_array(instruments_unparsed->data[i*2 + 1]);
        int32_t instrument_params_count = instrument_params_unparsed->count;

        const int32_t instrument_channel = janet_unwrap_integer(instrument_params_unparsed->data[0]); //first value is our channel

	    auto instruments_params_vec = std::vector<string>();

        for (int32_t j = 1; j < instrument_params_count; j++) {
            const string param_string = reinterpret_cast<const char *> janet_unwrap_string(instrument_params_unparsed->data[j]);
            instruments_params_vec.push_back(param_string);
        }

        instruments_vec.push_back((Instrument) {
            instrument_channel,
            instrument_name,
            instruments_params_vec,
        });
    }

    struct sort_by_channel //We do this so that wires will be created after the instruments they connect
    {
        inline bool operator() (const Instrument& instrument1, const Instrument& instrument2)
        {
            return (instrument1.channel < instrument2.channel);
        }
    };

    std::sort(instruments_vec.begin(), instruments_vec.end(), sort_by_channel());

    return (StartResult) {
        .environment = reinterpret_cast<uintptr_t>(envTable),
        .lloop_names = keys_vec,
        .instrument_mappings = instruments_vec,
        .bpm = bpm
    };
}

ContinueResult trane_continue(uintptr_t environment_ptr, string loop_name, double start_beat) {
    if (janetfn_run == NULL) {
        janet_panicf("unable to initialize runner");
    }

    JanetTable *environment = reinterpret_cast<JanetTable *>(environment_ptr);

    Janet run_result;
    const Janet args[3] = { janet_wrap_table(environment), janet_ckeywordv(loop_name.c_str()), janet_wrap_number(start_beat)};
    if (!call_fn(janetfn_run, 3, args, &run_result)) {
        return continue_error("evaluation error");
    }
    janet_gcroot(run_result); //TODO this might want to go before the run call 
    janet_gcunroot(run_result);

    const Janet * result_unparsed = janet_unwrap_tuple(run_result);

    const double rest_time = janet_unwrap_number(result_unparsed[0]);
    JanetArray *notes = janet_unwrap_array(result_unparsed[1]);
	int32_t count = notes->count;

    auto note_vec = std::vector<Note>();

    for (int32_t i = 0; i < count; i++) {
        const Janet * note = janet_unwrap_tuple(notes->data[i]);
        const int32_t channel = janet_unwrap_integer(note[0]);
        const double pitch = janet_unwrap_number(note[1]);
        const double vel = janet_unwrap_number(note[2]);
        const double start = janet_unwrap_number(note[3]);
        const double dur = janet_unwrap_number(note[4]);

        note_vec.push_back((Note) {
		channel,
                pitch,
                vel,
                start,
                dur,
                });
    }

    return (ContinueResult) {
        .is_error = false,
        .error = "",
        .notes = note_vec,
        .rest_length = rest_time,
    };
}

// TODO: just use JanetBuffer? Why am I bothering with this?
unsigned char *read_file(const char *filename, size_t *length) {
    size_t capacity = 2 << 17;
    unsigned char *src = (unsigned char *)malloc(capacity * sizeof(unsigned char));
    assert(src);
    size_t total_bytes_read = 0;
    FILE *file = fopen(filename, "r");
    assert(file);
    size_t bytes_read;
    do {
        size_t remaining_capacity = capacity - total_bytes_read;
        if (remaining_capacity == 0) {
            capacity <<= 1;
            src = (unsigned char *)realloc(src, capacity * sizeof(unsigned char));
            assert(src);
            remaining_capacity = capacity - total_bytes_read;
        }

        bytes_read = fread(&src[total_bytes_read], sizeof(unsigned char), remaining_capacity, file);
        total_bytes_read += bytes_read;
    } while (bytes_read > 0);

    fclose(file);
    *length = total_bytes_read;
    return src;
}

EMSCRIPTEN_KEEPALIVE
int main() {
    janet_init();
    JanetTable *lookup = env_lookup_table(janet_core_env(NULL), "load-image-dict");

    size_t image_length;
    unsigned char *image = read_file("trane.jimage", &image_length);

    Janet environment = janet_unmarshal(image, image_length, 0, lookup, NULL);
    if (!janet_checktype(environment, JANET_TABLE)) {
        janet_panicf("invalid image %q", environment);
    }

    janetfn_evaluate = env_lookup_function(janet_unwrap_table(environment), "evaluator/evaluate");
    janet_gcroot(janet_wrap_function(janetfn_evaluate));
    janetfn_run = env_lookup_function(janet_unwrap_table(environment), "runner/run");
    janet_gcroot(janet_wrap_function(janetfn_run));
    janetfn_print_instruments = env_lookup_function(janet_unwrap_table(environment), "runner/print_instruments");
    janet_gcroot(janet_wrap_function(janetfn_print_instruments));
    janetfn_print_loops = env_lookup_function(janet_unwrap_table(environment), "runner/print_loops");
    janet_gcroot(janet_wrap_function(janetfn_print_loops));
}

EMSCRIPTEN_BINDINGS(module) {
    using namespace emscripten;

    value_object<Note>("Note")
        .field("channel", &Note::channel)
        .field("pitch", &Note::pitch)
        .field("vel", &Note::vel)
        .field("start", &Note::start)
        .field("dur", &Note::dur)
        ;

    value_object<Instrument>("Instrument")
        .field("channel", &Instrument::channel)
        .field("name", &Instrument::name)
        .field("args", &Instrument::args)
        ;

    register_vector<Instrument>("InstrumentVector");
    register_vector<Note>("NoteVector");
    register_vector<string>("StringVector");

    value_object<CompileResult>("CompileResult")
        .field("isError", &CompileResult::is_error)
        .field("error", &CompileResult::error)
        .field("image", &CompileResult::image)
        ;

    value_object<StartResult>("StartResult")
        .field("environment", &StartResult::environment)
        .field("lloop_names", &StartResult::lloop_names)
        .field("instrument_mappings", &StartResult::instrument_mappings)
        .field("bpm", &StartResult::bpm)
        ;

    value_object<ContinueResult>("ContinueResult")
        .field("isError", &ContinueResult::is_error)
        .field("error", &ContinueResult::error)
        .field("notes", &ContinueResult::notes)
        .field("rest_length", &ContinueResult::rest_length)
        ;

    function("trane_compile", &trane_compile);
    function("trane_start", &trane_start);
    function("trane_continue", &trane_continue);
    function("retain_environment", &retain_environment);
    function("release_environment", &release_environment);
    function("retain_image", &retain_image);
    function("release_image", &release_image);
};
