class Navbar {
  constructor() {
    this.isOpen = false;
  }

  toggleNavbar() {
    this.isOpen = !this.isOpen;
  }
}

au.enhance({
  host: document.querySelector('[data-name="navbar"]'),
  root: Navbar
});