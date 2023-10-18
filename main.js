"use strict";

// class workouts

class Workouts {
  // varibles for this Workouts
  date = new Date();
  id = (Date.now() + "").slice(-10);
  clicks = 0;
  
  // constructor
  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
   
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
   
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()} `
  }

  click() {
    this.clicks++ 
  }
}



class Running extends Workouts {
  type = "running";

  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.calcpace()
    this._setDescription() 
  }
  // pace method for running
  calcpace() {
    this.pace = this.duration / this.distance;
    return this.pace
  }
}

class Cycling extends Workouts {
  type = "cycling";
  constructor(coords, duration, distance, elevationGain) {
    super(coords, duration, distance);
    this.elevationGain = elevationGain;
    this.calcspeed()
    this._setDescription() 
  }
  // speed method for cycling
  calcspeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed
  }
}

// const running = new Running([17, -1],5, 5,190);
// const cycl = new Cycling([17, -1], 4, 6,180);
// console.log(running, cycl);
// Creating an architecture for Geolocation API. Form the client story.
// This is what the client needs

const formEl = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  //  creating Properties

  #map;
  #mapZoom = 13;
  #mapEvent;
  #workout = [];
  // How Geolocation works in javascript
  constructor() {
    // function get geolocation position
    this._getPosition();

    // Getting from LocalStorage
    this._getFromLocalStorage();

    // function for Event handlers
    formEl.addEventListener("submit", this._NewWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  // get position method
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`Could't get current position`);
        }
      );
  }

  // Load the map method
  _loadMap(position) {
    // console.log(position);
    const { latitude, longitude } = position.coords;
    // const{  } = position.coords;

    //   coordinates array
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, this.#mapZoom);

    L.tileLayer(`https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`, {
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
    }).addTo(this.#map);

    //   map event handler
    this.#map.on("click", this._showFormInput.bind(this));

    // Rendering the workOut on the map after localstorage get
    this.#workout.forEach(work => {
      console.log(work);
      this._renderWorkoutMarker(work)
    })

   
  }

  // Show form input event for
  _showFormInput(mapE) {
    this.#mapEvent = mapE;
    // console.log(mapEvent)

    // Dispaying form input
    formEl.classList.remove("hidden");
    inputDistance.focus();
    // inputCadence.focus()
  }

  // Hide form input event function
  _hideForm() {
 // clearing inputFields
 inputDistance.value =
 inputCadence.value =
 inputDuration.value =
 inputElevation.value =
   "";

   formEl.style.display = "none";

   formEl.classList.add("hidden");

   setTimeout(() => formEl.style.display ='grid', 100)
  }
  // toggle form input event ElevationField
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");

    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }
  // submit form event For NewWorkout
  _NewWorkout(e) {
    
    // constructing a helper function
    const validInputs = (...inputs) => inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0)
    e.preventDefault();

    // creating new workout functions
    // Getting data from form input
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // conditioning Workout Running
    // If workout running, create running object
    if (type === "running") {
      
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) || 
        !allPositive(distance, duration, cadence)
      )
      
        return alert("Inputs have to be positive numbers!");
        

      workout = new Running([lat, lng], distance, distance, cadence);
    }

    // conditioning Workout cycling
    // If workout cycling, create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;
      console.log(" elevation",elevation);
      if (!validInputs(distance, duration, elevation) || 
        !allPositive(distance, duration)
      )
        return alert("Inputs have to be positive numbers!");

      workout = new Cycling([lat, lng], distance, distance, elevation);
    }

    // Adding a new  Object  to workout

    this.#workout.push(workout);

    // console.log(workout);
    // Render workout on the map
    this._renderWorkoutMarker(workout);

    //  Render workout list
    this._renderWorkout(workout);

    // hide form call
    this._hideForm();

    // Localestorage
    this._setLocalStorage()
   
  }

  // Render function
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${ workout.type === 'running' ? '🏃‍♂️': '🚴‍♀️'} ${ workout.description}`)
      .openPopup();
  }

  // Workout list
  _renderWorkout(workout) {
    let html = `
  <li class="workout workout--${workout.type}" data-id="${workout.id}">
  <h2 class="workout__title">${workout.description}</h2>
  <div class="workout__details">
    <span class="workout__icon">${ workout.type === 'running' ? '🏃‍♂️': '🚴‍♀️'}</span>
    <span class="workout__value">${ workout.distance}</span>
    <span class="workout__unit">km</span>
  </div> 
  <div class="workout__details">
  <span class="workout__icon">⏱</span>
  <span class="workout__value">${workout.duration}</span>
  <span class="workout__unit">min</span>
</div>`;

    if (workout.type === "running")
      html += `<div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.pace.toFixed(1)}</span>
  <span class="workout__unit">min/km</span>
</div>
<div class="workout__details">
<span class="workout__icon">🦶🏼</span>
<span class="workout__value">${workout.cadence}</span>
<span class="workout__unit">spm</span>
</div>`;

    if (workout.type === "cycling")
      html += `
<div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.speed.toFixed(1)}</span>
  <span class="workout__unit">km/h</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⛰</span>
  <span class="workout__value">${workout.elevationGain}</span>
  <span class="workout__unit">m</span>
</div>`;
formEl.insertAdjacentHTML('afterend',html);
  }
  
  // Popup movement

  _moveToPopup(e){
    const workoutEl = e.target.closest('.workout')
    // console.log(workoutEl);
    if (!workoutEl) return

    const workout = this.#workout.find(work => work.id === workoutEl.dataset.id);
    console.log(workout);
    this.#map.setView(workout.coords,this.#mapZoom, {
      animate : true,
      pan:{
        duration: 1
      }
    });
     // using the public interface
      // workout.click()
  }

  // localstorage function
 _setLocalStorage(){
  localStorage.setItem('workout',JSON.stringify(this.#workout))
 }

//  Get from local storage
_getFromLocalStorage(){
  const data = JSON.parse(localStorage.getItem('workout'))
  // console.log(data);

  // Guard statement
  if(!data) return

  // Restore our workout
  this.#workout = data
  
  // Render workout in the list 
  this.#workout.forEach(work => {
    // New Workout in sidebar
    this._renderWorkout(work)
  })
}

  // public methods
  reset(){
    localStorage.removeItem('workout')
    location.reload()
  }
}
const app = new App();
// ``
// console.log(app);

// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//     //   console.log(position);
//       const { latitude, longitude } = position.coords;

//     //   coordinates array
//     const coords = [latitude, longitude];

//        map = L.map("map").setView(coords, 13);

//       L.tileLayer(`https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`, {
//         attribution:
//           `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
//       }).addTo(map);

//     //   map event handler
//     map.on('click', function (mapE) {
//         mapEvent = mapE
//         // console.log(mapEvent)

//         // Dispaying form input
//         formEl.classList.remove('hidden');
//         inputDistance.focus();
//         // inputCadence.focus()

//     })

//       console.log(
//         `https://www.google.com/maps/@${latitude},${longitude},16z?entry=ttu`
//       );
//     },

//     function () {
//       alert(`Could't get current position`);
//     }
//   );

// formEl.addEventListener('click',function(e){
//   e.preventDefault()

//   // clearing inputFields
//   inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
//   // Displaying Maker
//    const { lat, lng } = mapEvent.latlng;
//       // console.log(lat, lng);
//     L.marker([lat, lng])
//       .addTo(map)
//       .bindPopup(
//           L.popup({
//           maxWidth: 250,
//           minWidth: 100,
//           autoClose : false,
//           closeOnClick : false,
//           className : 'running-popup'

//       }))
//       .setPopupContent('Workout')
//       .openPopup();
// })

// inputType.addEventListener('change',function() {

//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');

//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

// });
