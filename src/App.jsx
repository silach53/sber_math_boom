import React, { Component } from "react";
import "./App.css";
import {
  createSmartappDebugger,
  createAssistant,
} from "@salutejs/client";

import {
  AssistantProvider,
  useAssistant,
  useAssistantOnSmartAppData,
  useAssistantOnNavigation,
  useAssistantOnData,
  useAssistantState,
} from '@salutejs/client';

import "./App.css";

const initializeAssistant = (getState/*: any*/) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "",
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  }
  return createAssistant({ getState });
};



class App extends Component {
  constructor() {
    super();
    this.state = {
      maxNumber: 10,
      dep: 1,
      expression: "",
      resultMessage: "",
      modalDisplay: "none",
      gameDisplay: "none",
      settingsDisplay: "none",
      welcomeDisplay: "block",
    };

    this.maxNumberInput = React.createRef();
    this.depInput = React.createRef();

    this.assistant = initializeAssistant(() => this.getStateForAssistant() );
    this.assistant.on("data", (event/*: any*/) => {
      console.log(`assistant.on(data)`, event);
      const { action } = event
      console.log('action cur = ', action);
      this.dispatchAssistantAction(action);
    });
    this.assistant.on("start", (event) => {
      console.log(`assistant.on(start)`, event);
    });
  }

  handleKeyDown = (event) => {
    let nextElement;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextElement = event.target.previousElementSibling;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextElement = event.target.nextElementSibling;
        break;
      case 'Enter':
        this.saveSettings();
        return; // Exit if it's 'Enter'
      default:
        return; // Exit if it's not an arrow key
    }

    if (nextElement && (nextElement.tabIndex >= 0 || nextElement instanceof HTMLButtonElement)) {
      event.preventDefault();
      nextElement.focus();
    }
  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  getStateForAssistant() {
    console.log('getStateForAssistant: this.state:', this.state);
    const state = {
      game: {
        maxNumber: this.state.maxNumber,
        dep: this.state.dep,
        expression: this.state.expression,
        resultMessage: this.state.resultMessage,
        modalDisplay: this.state.modalDisplay,
        gameDisplay: this.state.gameDisplay,
        settingsDisplay: this.state.settingsDisplay,
        welcomeDisplay: this.state.welcomeDisplay,
      },
    };
    console.log('getStateForAssistant: state:', state);
    return state;
  }

  dispatchAssistantAction (action) {
    console.log('dispatchAssistantAction', action);
    if (action) {
    console.log('dispatchAssistantAction', action);
     switch (action.type) {
      case "settings":
        this.openSettings_2(); 
        break;
      case "example":
        this.startGame(); 
        break;
      case "save_answer":
        this.submitAnswer();
        break;
      case "save":
        this.saveSettings(); 
        break;
      case "rules":
        this.openRules_2();
         break;
      case "complex":
        if (action.note) {
          const newComplex = parseInt(action.note);
          document.getElementById("depth").value =  parseInt(newComplex);
          this._send_action_value('waiting_save', {
            'note': 1,
            'note2': 1
          });
        }
        break;
      case "max_number":
        if (action.note) {
          const newMaxNumber = parseInt(action.note);
          document.getElementById("max-number").value =  parseInt(newMaxNumber);
          this._send_action_value('waiting_save', {
            'note': 1,
            'note2': 1
          });
        }
        break;
      case "add_note":
        this.giveAnswer(action);
      }
      } 
  }

  openRules_2 = () => {
    this.closeAll();
    this.setState({ modalDisplay: "block" });
  };

  openRules = () => {
    this.closeAll();
    this.setState({ modalDisplay: "block" });
    this._send_action_value('rules', {
      'note': 1,
      'note2': 1
    });
  };

  startGame = () => {
    this.closeAll();
    this._send_action_value('example', {
      'note': 1,
      'note2': 1
    });
    this.setState({
      resultMessage: "",
      gameDisplay: "block",
      expression: this.generateExpression(),
    });
  };
  

  submitAnswer = () => {
    const userAnswer = document.getElementById("answer").value;
    const operator = document.getElementById("expression").textContent;
    const correctAnswer = eval(operator);
    this._send_action_value('done', {
      'note':userAnswer,
      'true_value':eval(correctAnswer)
    });
    if (userAnswer == correctAnswer) {
      this.setState({
        resultMessage: { text: "Верно!", className: "correct" },
      });
      this.setState({ expression: this.generateExpression() });
      document.getElementById("answer").value = "";
    } else {
      this.setState({
        resultMessage: { text: "Неверно! \n Попробуйте снова", className: "incorrect" },
      });
    }
  };

  openSettings_2 = () => {
    this.closeAll();
    this.setState({ settingsDisplay: "block" });
    document.getElementById("max-number").value = this.state.maxNumber;
    document.getElementById("depth").value = this.state.dep;
  };

  openSettings = () => {
    this.closeAll();
    this.setState({ settingsDisplay: "block" });
    document.getElementById("max-number").value = this.state.maxNumber;
    document.getElementById("depth").value = this.state.dep;
    this._send_action_value('settings', {
      'note': 1,
      'note2': 1
    });
  };

  saveSettings = () => {
    const newMaxNumber = parseInt(document.getElementById("max-number").value);
    const newDep = parseInt(document.getElementById("depth").value);

    if (
      isNaN(newMaxNumber) ||
      isNaN(newDep) ||
      newDep > 4 ||
      newMaxNumber > 999 ||
      newDep < 1 ||
      newMaxNumber <= 0
    ) {
      document.getElementById("settings-error").textContent = "За гранью твоих возможностей!";
      document.getElementById("settings-error").style.display = "block";
      this._send_action_value('save_set', {
        'note': 1,
        'note2': 1
      });
      return;
    } else {
      this._send_action_value('save_set', {
        'note': 2,
        'note2': 1
      });
    }
  
    this.setState(
      {
        maxNumber: newMaxNumber,
        dep: newDep,
      },
      () => {
        document.getElementById("settings-error").textContent = "";
        document.getElementById("settings-error").style.display = "none";
        this.startGame();  // Here startGame will set gameDisplay to "block" and all others to "none"
      }
    );
  };

  generateValidExpression = (depth) => {
    let num1, num2;

    if (depth === 1) {
      num1 = Math.floor(Math.random() * this.state.maxNumber) + 1;
      num2 = Math.floor(Math.random() * this.state.maxNumber) + 1;
    } else {
      num1 = this.generateValidExpression(depth - 1);
      num2 = this.generateValidExpression(depth - 1);
    }

    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    return [num1, operator, num2];
  };

  parseExpression = (components, depth) => {
    if (depth === 1) {
      return "(" + components.join(" ") + ")";
    } else {
      const num1Sub = this.parseExpression(components[0], depth - 1);
      const num2Sub = this.parseExpression(components[2], depth - 1);
      const oper = components[1];
      return `(${num1Sub} ${oper} ${num2Sub})`;
    }
  };

  generateExpression = () => {
    document.getElementById("answer").value = "";
    const newExpression = this.generateValidExpression(this.state.dep);
    return this.parseExpression(newExpression, this.state.dep);
  };

  // New function to close all windows
  closeAll = () => {
    this.setState({
      modalDisplay: "none",
      gameDisplay: "none",
      settingsDisplay: "none",
      welcomeDisplay: "none",
    });
  }

  windowClick = (event) => {
    if (event.target === document.getElementById("rules-modal")) {
      this.setState({ modalDisplay: "none" });
    }
  };

  _send_action_value(action_id, value) {
    const data = {
      action: {
        action_id: action_id,
        parameters: {   // значение поля parameters может любым, но должно соответствовать серверной логике
          value: value, // см.файл src/sc/noteDone.sc смартаппа в Studio Code
        }
      }
    };
    const unsubscribe = this.assistant.sendData(
      data,
      (data) => {   // функция, вызываемая, если на sendData() был отправлен ответ
        const {type, payload} = data;
        console.log('sendData onData:', type, payload);
        unsubscribe();
      });
    }

  giveAnswer = (anyText) => {
    console.log('anyText.note:', anyText.note);
    console.log('this.state.expression:', this.state.expression);
    // You might want to do validation of anyText before setting it as a value
    document.getElementById("answer").value = anyText.note;
    this.submitAnswer();
  };
  
  handleSubmit = (event) => {
    event.preventDefault();  // Prevents the page from refreshing
    this.submitAnswer();
  }
  

  render() {
    const {
      expression,
      resultMessage,
      modalDisplay,
      gameDisplay,
      settingsDisplay,
      welcomeDisplay,
    } = this.state;

    // Disable zooming by adding the viewport meta tag
    const disableZoom = () => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no");
      document.head.appendChild(meta);
    };

    disableZoom(); // Call the function to disable zooming

    return (
      <div className="App">
        <div id="welcome" className="page main-block" style={{ display: welcomeDisplay }}> {/* Added main-block */}
        <h1>Добро пожаловать в игру <br />«Математический бум»!</h1>
          <button id="start-btn" onClick={this.openRules}>
            Погнали
          </button>
        </div>
        <div id="rules-modal" className="modal rules-modal main-block custom-modal" style={{ display: modalDisplay }}>
            <div className="modal-content">
            <h1>Правила игры</h1>
            <p>1. Вам будет предложено вычислить выражение.</p>
            <p>2. Введите ваш ответ в предоставленное поле ввода или ответьте словами.</p>
            <p>3. Нажмите кнопку «Сохранить», чтобы проверить ваш ответ.</p>
            <button id="start-game-btn" onClick={this.startGame}>
              Начать игру
            </button>
          </div>
        </div>

        <div id="game" className="page main-block" style={{ display: gameDisplay }}> {/* Added main-block */}
          <h1>Вычислите:</h1>
          <div id="expression-container">
            <span id="expression" className="expression-large">
              {expression && expression.substring(1, expression.length - 1)}
            </span>
          </div>
          <form onSubmit={this.handleSubmit}>
            <input type="number" id="answer" placeholder="Введите ваш ответ" className="larger-input" />
            <div className="button-group">
              <button id="submit-btn" type="submit">
                  Отправить
              </button>
              <button id="settings-btn" type="button" onClick={this.openSettings}>
                  Настройки
              </button>
            </div>
          </form>

          <p
          id="result-message"
          style={{ fontSize: "18px", fontWeight: "bold" }}
          className={resultMessage.className}
          >
          {resultMessage.text}
          </p>
        </div>

        <div id="settings" className="page settings-block" style={{ display: settingsDisplay }}>
          <h2>Настройки</h2>
          <label htmlFor="max-number">Максимальное число (1-999):</label>
          <input
            ref={this.maxNumberInput}
            type="number"
            id="max-number"
            defaultValue={this.state.maxNumber}
            min="1"
            max="999"
            required
            className="larger-input"
            onKeyDown={this.handleKeyDown}
            onChange={(event) => this.setState({ maxNumber: event.target.value })}
          />
          <br />
          <label htmlFor="depth">Сложность (1-4):</label>
          <input 
            ref={this.depInput}
            type="range"
            id="depth"
            min="1"
            max="4"
            step="1"
            defaultValue={this.state.dep}
            className="larger-input"  // And here
            onKeyDown={this.handleKeyDown}
            onChange={(event) => this.setState({ dep: event.target.value })}
          />
          <br />
          <p id="settings-error" style={{ color: "red", display: "none" }}></p>
          <button id="save-settings-btn" onClick={this.saveSettings}>
            Сохранить
          </button>
        </div>
      </div>
    );
  }
}

export default App;