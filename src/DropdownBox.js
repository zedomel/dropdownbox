// DropdownBox.js
import './styles.css';

export default class DropdownBox {
    constructor(containerSelector, options = {}) {
      this.container = document.querySelector(containerSelector);
      if (!this.container) {
        throw new Error(`Container with selector "${containerSelector}" not found.`);
      }
  
      // Default options
      this.options = {
        options: [],                
        onChange: null, // Callback for value changes
        onDropdownToggle: null, // Callback for dropdown toggle
        className: null,
        emptySummaryText: "Select an option",
        ...options,
      };
      this.inputs = [];
  
      // Initialize
      this.init();
    }
  
    init() {
      // Clear the container
      this.container.innerHTML = '';
  
      // Generate the main structure
      this.generateHTML();
  
      // Cache DOM elements
      this.$summary = this.container.querySelector('.summary');
      this.$dropbox = this.container.querySelector('.box .js-drop');      
  
      // Bind event listeners
      this.bindEvents();
      
      // Update summary
      this.updateSummary();
    }
  
    generateHTML() {
      // Create the main container      
      const box = this.createBox(this.options.className, this.generateOptions());      
  
      // Append all boxes to the container
      this.container.appendChild(box);          
    }
  
    createBox(className, content) {
      const box = document.createElement('div');
      box.className =  `dropdownbox box ${className}`;
          
      const inputBox = document.createElement('div');
      inputBox.className = 'inputBox';
  
      const summary = document.createElement('span');
      summary.className = 'summary noselect js-toggle-drop';

      summary.textContent = "";
      inputBox.appendChild(summary);
  
      const options = document.createElement('div');
      options.className = 'options js-drop';
      options.style.display = 'none';
      options.appendChild(content);
      inputBox.appendChild(options);
  
      box.appendChild(inputBox);

      return box;
    }
    
    generateOptions() {
      const fragment = document.createDocumentFragment();
  
      for (const option of this.options.options) {
        const optionBox = this.createOption(option);
        fragment.appendChild(optionBox);  
      }          
  
      return fragment;
    }
      
    createOption(option) { //id, label, description, value, min, max) {
      const optionEl = document.createElement('div');
      optionEl.className = 'option';
  
      const col1 = document.createElement('div');
      col1.className = 'col1';
  
      const labelSpan = document.createElement('span');
      labelSpan.className = 'option-label';
      labelSpan.innerHTML = option.label;
      col1.appendChild(labelSpan);
  
      if (option.description) {
        const descSpan = document.createElement('span');
        descSpan.className = 'option-desc';
        descSpan.innerHTML = option.description;
        col1.appendChild(descSpan);
      }
  
      const col2 = document.createElement('div');
      col2.className = 'col2';
  
      if (option.min <= 1 && option.max === 1) {        
        const switchEl = this.createSwitch(option.id, option.name, option.value);
        col2.appendChild(switchEl);
      } else {
        const stepper = this.createStepper(option.id, option.name, option.value, option.min, option.max);
        col2.appendChild(stepper);        
      }
  
      optionEl.appendChild(col1);
      optionEl.appendChild(col2);
  
      return optionEl;
    }
  
    createStepper(id, name, value, min, max) {
      const stepper = document.createElement('div');
      stepper.className = 'stepper';
      stepper.setAttribute('data-min', min ?? null);
      stepper.setAttribute('data-max', max ?? null);
  
      const stepDown = document.createElement('span');
      stepDown.className = 'step down noselect is-disabled';      
      stepDown.setAttribute('aria-disabled', 'true');
      stepDown.textContent = '-';
      stepper.appendChild(stepDown);
  
      const input = document.createElement('input');
      input.type = 'text';
      input.className = `tbx_stepper input-${id}`;
      input.value = value ?? null;
      input.name = name ?? null;
      input.id = `input-${id}`;
      input.readOnly = true;
      stepper.appendChild(input);
  
      const stepUp = document.createElement('span');
      stepUp.className = 'step up noselect';      
      stepUp.textContent = '+';
      stepper.appendChild(stepUp);
  
      return stepper;
    }

    createSwitch(id, name, value) {    
    const switchEl = document.createElement('div');
    switchEl.className = 'switch';    
    
    const label = document.createElement('label');
    label.className = 'switch';
    switchEl.appendChild(label);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = `tbx_switch input-${id}`;
    input.value = value ?? null;
    input.name = name ?? null;
    input.id = `input-${id}`;    
    label.appendChild(input);

    const span = document.createElement('span');
    span.className = 'slider';
    label.appendChild(span);

    return switchEl;
    }
  
    bindEvents() {
      // Toggle dropdowns
      this.container.querySelectorAll('.js-toggle-drop').forEach((toggle) => {
        toggle.addEventListener('click', (e) => {
          const drop = e.currentTarget.nextElementSibling;
          drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
  
          // Trigger dropdown toggle callback
          if (this.options.onDropdownToggle) {
            this.options.onDropdownToggle(e.currentTarget, drop);
          }
        });
      });
  
      // Stepper functionality
      this.container.querySelectorAll('.stepper').forEach((stepper) => {
        const $input = stepper.querySelector('.tbx_stepper');
        const $down = stepper.querySelector('.step.down');
        const $up = stepper.querySelector('.step.up');
  
        $down.addEventListener('click', () => this.updateStepper($input, -1));
        $up.addEventListener('click', () => this.updateStepper($input, 1));
      });      

      this.container.querySelectorAll('.switch').forEach((switchEl) => {
        const $input = switchEl.querySelector('.tbx_switch');
        $input.addEventListener('change', () => this.updateSwitch($input));
      });
    }
  
    updateStepper(input, change) {      
      const min = parseInt(input.parentElement.dataset.min, 10);
      const max = parseInt(input.parentElement.dataset.max, 10);      
      let value = parseInt(input.value, 10);
  
      value += change;
      value = Math.max(min, max ? Math.min(max, value) :  value); // Clamp value between min and max
  
      input.value = value;
  
      // Enable/disable buttons
      const $down = input.parentElement.querySelector('.step.down');
      const $up = input.parentElement.querySelector('.step.up');
      if (min != null) {
        $down.setAttribute('aria-disabled', value <= min);
      }
      if (max != null) {
            $up.setAttribute('aria-disabled', value >= max);
      }
  
      // Update summary
      this.updateSummary();
  
      // Trigger value change callback
      if (this.options.onChange) {
        this.options.onChange(input, value);
      }
    }

    updateSwitch(input) {
      this.updateSummary();
      // Trigger value change callback
      if (this.options.onChange) {
        this.options.onChange(input, input.value);
      }
    }
  
    updateSummary() {        
      let summaryText = this.options.options.map((o) => {
        let input = this.container.querySelector('.box .stepper .tbx_stepper.input-' + o.id + ', .box .switch .tbx_switch.input-' + o.id);
        let val = parseInt(input.value, 10);
        if (input.type === 'checkbox') {
          val = input.checked | 0;
        }

        if (val > 0) {
            return  input.type === 'checkbox' ?  o.label : `${val} ${o.label}`;
        }        
        return false;
      }).filter(o => o).join(", ");      
      this.$summary.textContent = summaryText !== "" ? summaryText : this.options.emptySummaryText;
    }
  }