
class FormContainer {

  constructor() {
    this.number = null
  }

  onSubmit() {
    alert(`Selected: ${this.number}`);
  }
}

au.enhance({
  host: document.querySelector('.form-container'),
  root: FormContainer,
  debug: true
}).catch(console.error);