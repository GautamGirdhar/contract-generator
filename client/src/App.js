import React from "react";
import { BrowserRouter } from "react-router-dom";
import ContractForm from "./ContractForm";
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContractForm />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
