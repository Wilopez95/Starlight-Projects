import controlImage from '../static/images/layers.png';
// create a custom control for style switcher
export class styleSwitcherControl {
  onAdd(map) {
    this.map = map;
    // create the container, needs to be a div for placement reasons
    this.container = document.createElement('div');
    // set class name, needs to remain mapbox-ctrl mapboxgl-ctrl-group
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

    this.button = document.createElement('button');
    this.image = document.createElement('img');
    this.image.className = 'mapboxgl-ctrl-icon';
    this.image.id = 'image-icon';
    this.image.src = controlImage;
    this.image.width = '30';
    this.image.height = '30';

    // create toggable buttons
    this.menu = document.createElement('div');
    this.menu.id = 'menu';
    // dark button
    this.buttonDark = document.createElement('button');
    this.buttonDark.id = 'dark-v9';
    this.buttonDark.textContent = 'Dark';
    // light button
    this.buttonLight = document.createElement('button');
    this.buttonLight.id = 'light-v10';
    this.buttonLight.textContent = 'Light';
    // outdoors button
    this.buttonOutdoors = document.createElement('button');
    this.buttonOutdoors.id = 'outdoors-v11';
    this.buttonOutdoors.textContent = 'Outdoors';
    // Satelitte button
    this.buttonSatellite = document.createElement('button');
    this.buttonSatellite.id = 'satellite-streets-v10';
    this.buttonSatellite.textContent = 'Satellite';
    // streets button
    this.buttonStreets = document.createElement('button');
    this.buttonStreets.id = 'streets-v11';
    this.buttonStreets.textContent = 'Streets';

    // Force breaks because display flex, flexDirection column is not working on menu
    this.break = document.createElement('br');
    this.break2 = document.createElement('br');
    this.break3 = document.createElement('br');
    this.break4 = document.createElement('br');

    this.menu.appendChild(this.buttonDark);
    this.menu.appendChild(this.break);
    this.menu.appendChild(this.buttonLight);
    this.menu.appendChild(this.break2);
    this.menu.appendChild(this.buttonOutdoors);
    this.menu.appendChild(this.break3);
    this.menu.appendChild(this.buttonSatellite);
    this.menu.appendChild(this.break4);
    this.menu.appendChild(this.buttonStreets);

    this.button.appendChild(this.image);
    this.container.appendChild(this.button);
    this.button.addEventListener('click', () => {
      // force a 'toggle' affect, also corrects behavior of being able to click on the style button twice and removing pins from map
      this.container.appendChild(this.menu);
      this.container.removeChild(this.button);
    });

    const buttons = this.menu.getElementsByTagName('button');
    function switchLayer(layer) {
      const layerId = layer.target.id;
      map.setStyle(`mapbox://styles/mapbox/${layerId}`);
    }
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].onclick = switchLayer;
      buttons[i].addEventListener('click', () => {
        // force a 'toggle' affect, also corrects behavior of being able to click on the style button twice and removing pins from map
        this.container.removeChild(this.menu);
        this.container.appendChild(this.button);
      });
    }

    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}
