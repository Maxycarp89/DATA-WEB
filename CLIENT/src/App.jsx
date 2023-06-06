import React,{ useRef, useState } from "react";
import Hero from "./components/Home";
import Cards from "./Components/Cards";
import "react-simple-keyboard/build/css/index.css";

import ReactDOM from "react-dom";
import Keyboard from "react-simple-keyboard";
import '../styles.css'

function App() {
  const [input, setInput] = useState("");
  const [layout, setLayout] = useState("default");
  const keyboard = useRef();

  const onChange = input => {
    setInput(input);
    console.log("Input changed", input);
  };

  const handleShift = () => {
    const newLayoutName = layout === "default" ? "shift" : "default";
    setLayout(newLayoutName);
  };

  const onKeyPress = button => {
    console.log("Button pressed", button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  const onChangeInput = event => {
    const input = event.target.value;
    setInput(input);
    keyboard.current.setInput(input);
  };
  return (
    <div className="App">
      <Hero />
      <input
        value={input}
        placeholder={" Ingresa tu DNI"}
        onChange={onChangeInput}
        />
         <Keyboard
        keyboardRef={r => (keyboard.current = r)}
        layoutName={layout}
        onChange={onChange}
        onKeyPress={onKeyPress}
        />
      <Cards />
    </div>
  );
}

export default App;
