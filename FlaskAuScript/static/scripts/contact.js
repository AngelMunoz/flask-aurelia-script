class AfContact {

  static inject() {
    return [au.validation.ValidationControllerFactory]
  }

  constructor(validationFactory) {
    this.email = '';
    this.name = '';
    this.message = '';
    this.readPolicy = false;
    this.sent = false;
    this.responseMessage = '';
    this.controller = validationFactory.createForCurrentScope();
  }

  get counter() {
    return 100 - this.message.length;
  }

  async onSubmit() {
    try {
      var response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: this.name,
          email: this.email,
          message: this.message
        }),
        redirect: "follow"
      }).then(res => res.json())
      this.sent = true;
    } catch (error) {
      console.warn(error);
    }
    this.responseMessage = response && response.message;
  }
}

au.enhance({
  host: document.querySelector('[data-name="afContact"'),
  root: AfContact,
  plugins: [au.validation.configure]
}).then(() => {
  var ret = au.validation.ValidationRules
    .ensure('email')
    .email()
    .required()
    .ensure('name')
    .required()
    .minLength(3)
    .ensure('message')
    .minLength(100)
    .maxLength(200)
    .required()
    .ensure('readPolicy')
    .required()
    .on(AfContact);
});
