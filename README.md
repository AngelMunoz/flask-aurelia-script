# Flask - Aurelia Script

[aurelia-script]: https://github.com/aurelia/script
[pipenv]: https://pipenv.readthedocs.io/en/latest/
[aurelia-validation]: https://aurelia.io/docs/plugins/validation/
- Do you have non javascript/node server side rendered website?
- Do you need to update an old jquery based flask website?

This might be insightful for you!

this repository contains some examples on how to use [aurelia-script] to enhance certain parts of your server side rendered system, and it's an approach that could be shared to other languages as well like PHP, .Net or Ruby among others.

<details>
  <summary>
  For example <b>FlaskAuScript\templates\contact.html</b> offers a form
  that works with or without any javascript enabled, if javascript is enabled   it uses also [aurelia-validation] to do secondary validation and some ux to   show/hide error reporting.
  </summary>

  ```hbs
  {% extends "layout.html" %}

  {% block content %}
  <section data-name="afContact">
    <form 
        if.bind="!sent" 
        submit.trigger="onSubmit(formErrors)" 
        action="/contact" 
        method="POST">
      <div 
        class="field" 
        validation-errors.bind='nameErrors'>
        <label class="label" for="name">Name</label>
        <div class="control">
          <input 
            class="input ${nameErrors.length > 0 ? 'is-danger' : ''}"
            placeholder="Let us know your name" type="text"
            name="name" 
            id="name"
            value.bind="name & validate" 
            required />
        </div>
        <p 
          class="help has-text-danger" 
          repeat.for="errorInfo of nameErrors"
          if.bind='nameErrors.length > 0'>
          ${errorInfo.error.message}
        </p>
      </div>
      <!-- form content -->
    </form>
    <h1 if.bind="sent && responseMessage">${responseMessage}</h1>
  </section>
  {% endif %}
  {% endblock %}

  {% block scripts %}
  <script type="module">
  class AfContact {
    /**
     * classic aurelia DI also worlks!
     */
    static inject() {
      return [au.validation.ValidationControllerFactory]
    }

    /**
     * by using the static inject above you are able to work with your
     * usual constructor DI wich is very good way to manage your class
     * dependencies
     */
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
        const body = {
            name: this.name,
            email: this.email,
            message: this.message
        };

        var response = await fetch('/contact', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body)
        })
        .then(res => res.json())
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
    plugins: [au.validation.configure],
    debug: true
  })
    .then(() => {
      au.validation
        .ValidationRules
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

  </script>
  {% endblock %}
  ```
</details>


<details>
  <summary>
    To see some aurelia refs, delegates and camera action you can check <b>FlaskAuScript\templates\pictures.html</b>
  </summary>
  
  ```hbs
  {% extends "layout.html" %}
  {% block content %}
  <section data-name="afPictures" class="af-pictures">
    <div class="af-camera-area">
      <video autoplay ref="videoRef" class="af-video"></video>
      <menu class="af-camera-controls">
        <button if.bind="!cameraStarted" class="button af-camera-control" click.delegate="startCamera()">
          <span class="icon">
            <i class="fas fa-play"></i>
          </span>
        </button>
        <button if.bind="cameraStarted" class="button af-camera-control" click.delegate="takePicture()">
          <span class="icon">
            <i class="fas fa-camera-retro"></i>
          </span>
        </button>
        <button if.bind="cameraStarted" class="button af-camera-control" click.delegate="switchCamera()">
          <span class="icon">
            <i class="fas fa-exchange-alt"></i>
          </span>
        </button>
        <button if.bind="cameraStarted" class="button af-camera-control" click.delegate="stopCamera()">
          <span class="icon">
            <i class="far fa-stop-circle"></i>
          </span>
        </button>
      </menu>
    </div>

    <ul if.bind="pictures.length > 0" class="af-img-list">
      <li repeat.for="picture of pictures">
        <figure class="image is-128x128">
          <img src.bind="picture.src">
        </figure>
      </li>
    </ul>
  </section>

  {% endblock %}

  {% block scripts %}
  <script type="module">
  import { MediaService } from '/static/scripts/helpers/camera.js';

  class AfPictures {

    constructor() {
      this.videoRef = null;
      this.cameraStarted = false;
      this.pictures = [];
      this.facingEnvironment = true;
    }

    /**
     * starts the camera stream trying to first use the rear camera
     * if not it tries to use the front camera if we're out of retries
     * it ends up using the most basic media constraing for video which is `{ video: true }`
     * @param {boolean} facingEnvironment 
     * @param {MediaStreamConstraints} constraints 
     * @param {number} retries 
     */
    async startCamera(facingEnvironment = this.facingEnvironment, constraints = null, retries = 2) {
      if (!this.$media) { this._configureMediaService() }

      const willUse = constraints || {
        video: { facingMode: { exact: facingEnvironment ? 'environment' : 'user' } }
      }

      try {
        await this.$media.startCamera(willUse);
      } catch (error) {
        if (retries > -1) {
          return this.startCamera(videoRef, !facingEnvironment, retries == 0 ? { video: true } : null, retries - 1)
        }
        console.warn(error);
      }

      this.cameraStarted = true;
      this.facingEnvironment = facingEnvironment;
    }

    async switchCamera() {
      try {
        await this.startCamera(!this.facingEnvironment);
      } catch (error) {
        console.warn(error.message)
      }
    }

    async stopCamera() {
      try {
        await this.$media.stopCamera();
        this.cameraStarted = false;
      } catch (error) {
        console.warn(error.message);
      }
    }

    async takePicture() {
      try {
        const src = await this.$media.takeScreenshot();
        this.pictures.push({ id: this._getRandomHex(), src });
      } catch (error) {
        console.warn(error.message);
      }
    }

    /**
     *
     * @param {HTMLVideoElement} videoRef
     */
    _configureMediaService(videoRef = null) {
      /**
       * @type {MediaService}
       */
      this.$media = new MediaService(videoRef || this.videoRef);
    }

    _getRandomHex() {
      return "000000".replace(/0/g, () => (~~(Math.random() * 16)).toString(16));
    }
  }

  au.enhance({
    host: document.querySelector('[data-name="afPictures"]'),
    root: AfPictures,
    debug: true
  }).catch(console.error);
  </script>
  {% endblock %}
  ```
</details>

If You are familiar with aurelia you can see things like
- `submit.trigger`
- `if.bind`
- `value.bind`
- `${variableInterpolation}`

which work just as any other aurelia-framework project you have used before

If you are familiar with flask but new to aurelia, you can see that having data binding,
sending json is just a matter of a few lines of code with code that is as vanilla javascript as possible.

No weird decorators syntax, no webpack, no bundlers/loaders mumbojumbo that you may not even want to deal with. Of course this is when you target modern browsers but aurelia-script ES5 builds are provided with UMD loader as well as without loader so you can plug in the solution you may already have for these things. 

For example if you must write ES5 syntax you can do the following
```js
class Contacts {
  constructor() {
    this.email = '';
  }

  onSubmit() {
    // do some ajax work
  }
}
au.enhance({
  host: document.querySelector('.contacts-form'),
  root: Contacts
})
```
to 
```js

function Contacts() {
  this.email = '';
}

Contacts.prototype.onSubmit = function() {
  // do some ajax work
}

au.enhance({
  host: document.querySelector('.contacts-form'),
  root: Contacts
})
```

and it will still work just as good as always

for more information and examples of [aurelia-script] please visit the repository
https://github.com/aurelia/script


If you want to play with this I recommend you to use [pipenv] and [vscode](https://code.visualstudio.com)

just clone then run
```
pipenv install
pipenv run flask run
```
and then visit http://localhost:5000

<details>
  <summary>
    If Using VsCode
  </summary>
  Due to some settings of the python extension of vscode
  I did not include .vscode into git
  but here are my settings

  ## settings.json
  ```javascript
  {
    "python.pythonPath": "PATH TO VIRTUALENV PYTHON",
    "files.exclude": {
      "**/.git": true,
      "**/.svn": true,
      "**/.hg": true,
      "**/CVS": true,
      "**/.DS_Store": true,
      "**/__pycache__": true
    }
  }
  ```

  ## launch.json
  ```javascript
  {
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Python: Flask",
        "type": "python",
        "request": "launch",
        "module": "flask",
        "env": {
          "FLASK_APP": "app.py",
          "FLASK_ENV": "development",
          "FLASK_DEBUG": "0"
        },
        "args": [
          "run",
          "--no-debugger",
          "--no-reload"
        ],
        "jinja": true
      }
    ]
  }
  ```

  ## extensions.json
  ```javascript
  {
    "recommendations": [
      "donjayamanne.python-extension-pack"
    ]
  }
  ```
</details>
