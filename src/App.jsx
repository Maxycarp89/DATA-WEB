import React from "react";
import Analytics from "./Components/Analytics";
import Hero from "./Components/Hero";
import NavBar from "./Components/NavBar";
import Newsletter from "./Components/Newsletter";
import Cards from "./Components/Cards";

function App() {
  return <div>
    <NavBar />
    <Hero />
    <Analytics />
    <Newsletter />
    <Cards />
  </div>;
}

export default App;
