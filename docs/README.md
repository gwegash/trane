# Trane Docs
Trane is a [domain specific language](https://en.wikipedia.org/wiki/Domain-specific_language) for creating music in the browser. It's written in [Janet](https://janet-lang.org/), an embeddable lisp-like language.


## Getting started
Creating music in Trane is largely done in two steps. Creating **instruments** and sending **events** to those instruments.

## Creating Instruments
You define instruments by declaring an audio graph at the top-level.

For example, to create simple sine oscillator synth, you can write this:
```
(synth :hello-world :wave "sine")
```
Instruments have to have a name, like `:hello-synth` so that we can send events to them later on.
This synth isn't very useful on it's own. It's just a synth sitting there, not connected to anything. 
We can wire it up to the master output (probably your speakers/headphones) by using a **wire**.

```
(wire :hello-world :out)
```

OK! Now we're ready to start sending events to this synthesizer. 

## Sequencing Events
Now that we have an instrument hooked up to our output, we can start sending it notes to play.

In Trane, you can send events from a **live_loop**

```
(live_loop :hello-loop               # create a live_loop, call it :hello-loop
  (play :C3 :hello-world :dur 0.5)   # send the note :C3 to :hello-world, with a duration of 0.5
  (sleep 1)                          # sleep for 1 beat
)
```

Let's have a look at what's going on here.  
A **live_loop** is like a regular loop that continues forever. We set one up here with the name `:hello-loop`.
It sends a `:C3` note to our synthesizer every beat.

You can change the body of the live loop while it's running.
Try changing the note from a `:C3` to a `:D3` (remember to re-evaluate your changes!). 
The live-loop will run the new body the next time it runs. In this example it runs every beat.

## Chaining effects

Let's create an effects chain. First let's delete any code we already have, starting from scratch.

First we'll create a sampler instrument, and wire it up to the output
```
(sample :hello-sample :url "tracks/choir%20g%20maj.wav" :pitch :G3)  # load a sample from the web with a pitch of :G3
```
Next let's create a lowpass [biquad filter](https://en.wikipedia.org/wiki/Digital_biquad_filter)


```
(biquad :hello-biquad :type "lowpass")
```

And let's wire them together like this `:hello-sample` -> `:hello-filter` -> `:out`
```
(wire :hello-sample :hello-biquad)
(wire :hello-biquad :out)
```

We'll send in some notes so that we can hear our changes to the audio graph too.
```
(live_loop :sample-player
  (play :G3 :hello-sample :dur 32)
  (sleep 8)
)
```

OK! You should be able to hear a sample playing now. Try messing around with the knobs on the right.


### Chaining
This method of wiring instruments and effects together works, but it's quite hard to see the arrangement of the audio graph.

**Chaining** instruments and effects lets us achieve the same thing, but it's a bit more intuitive and uses less code.

To create the same audio graph as above, we can instead write the following: 
```
(chain 
  (sample :hello-sample :url "tracks/choir%20g%20maj.wav" :pitch :G3)
  (biquad :hello-biquad :type "lowpass")
  :out
)
```
(If you see an error you'll need to delete your previous audio graph first: your sampler, biquad and wires)
The code above is shorthand for the manual instrument creation and wiring we wrote before.
It's much easier to read. 

## Instrument parameters
Let's keep the code around from the last section. You can change the instrument parameters with the knobs on the right. What if you want to change them from code?

Let's create a live_loop that sweeps through the filter cutoff. 

```
(live_loop :filter-sweeper 
  (for i 200 900                          # i in range 200 900
    (change :hello-biquad :frequency i)   # set the frequency cutoff to the value of 'i'
    (sleep 0.01)
  )
)
```

**change** lets us update parameters on effects and instruments.
Other methods that do this are **target**, **itarget**, **lin** and  **exp**.

### More
This documentation is incomplete. For a fuller picture, check out the [DSL](https://github.com/gwegash/trane/blob/master/src/dsl.janet) and the [examples](https://github.com/gwegash/tracks). 

## Further Reading
* [Trane Examples](https://github.com/gwegash/tracks)
* [janet-lang.org](https://janet-lang.org/)
* [Janet for Mortals](https://janet.guide/)
