class OutputChannel {
  private _target: HTMLElement | null = null;

  set target(value: HTMLElement | null) {
    this._target = value;
  }

  clearErrors() {
    while (this._target?.firstChild) {
      this._target.removeChild(this._target.firstChild);
    }
  }

  print(text: string, isErr: boolean) {
    //TODO printing other things
    if (this._target == null) {
      if (isErr) {
        console.error(text);
      } else {
        console.log(text);
      }
    } else {
      const span = document.createElement('span');
      span.classList.toggle('janet-err', isErr);
      span.appendChild(document.createTextNode(text));
      span.appendChild(document.createTextNode('\n'));
      this._target.prepend(span);
    }
  }
}

export {OutputChannel}
