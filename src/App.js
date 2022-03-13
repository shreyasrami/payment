import Axios from "axios";
import React, { useState } from "react";
import "./App.css";
import { server } from "./server";

function App() {
  const [funding_id, setFundingID] = useState("");
  const [amount_donated, setAmountDonated] = useState("");
  const [donation_message, setDonationMessage] = useState("");


// this function will handel payment when user submit his/her money
// and it will confim if payment is successfull or not
  const handlePaymentSuccess = async (response) => {
    try {
      let bodyData = new FormData();

      // we will send the response we've got from razorpay to the backend to validate the payment
      bodyData.append("response", JSON.stringify(response));

      await Axios({
        url: `${server}/payment/payment/success/`,
        method: "POST",
        data: bodyData,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          console.log("Everything is OK!");
          setFundingID("");
          setAmountDonated("");
          setDonationMessage("");

        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(console.error());
    }
  };

  // this will load a script tag which will open up Razorpay payment card to make //transactions
  const loadScript = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  };

  const showRazorpay = async () => {
    const res = await loadScript();

    let bodyData = new FormData();

    // we will pass the amount and product name to the backend using form data
    bodyData.append("amount_donated", amount_donated.toString());
    bodyData.append("funding_id", funding_id.toString());
    bodyData.append("donation_message", donation_message.toString());
    

    const data = await Axios({
      url: `${server}/payment/pay/`,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: bodyData,
    }).then((res) => {
      return res;
    });

    // in data we will receive an object from the backend with the information about the payment
    //that has been made by the user

    var options = {
      key_id: process.env.REACT_APP_PUBLIC_KEY, // in react your environment variable must start with REACT_APP_
      key_secret: process.env.REACT_APP_SECRET_KEY,
      amount: data.data.payment.amount,
      currency: "INR",
      name: "Org. Name",
      description: "Test teansaction",
      image: "", // add image url
      order_id: data.data.payment.id,
      handler: function (response) {
        // we will handle success by calling handlePaymentSuccess method and
        // will pass the response that we've got from razorpay
        handlePaymentSuccess(response);
      },
      prefill: {
        name: "User's name",
        email: "User's email",
        contact: "User's phone",
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    var rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div className="container" style={{ marginTop: "20vh" }}>
      <form>
        <h1>Payment page</h1>

        <div className="form-group">
          <label htmlFor="funding_id">Funding ID</label>
          <input
            type="text"
            className="form-control"
            id="funding_id"
            value={funding_id}
            onChange={(e) => setFundingID(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount_donated">Donation Amount</label>
          <input
            type="text"
            className="form-control"
            id="amount_donates"
            value={amount_donated}
            onChange={(e) => setAmountDonated(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="donation_message">Donation Message</label>
          <input
            type="text"
            className="form-control"
            id="donation_message"
            value={donation_message}
            onChange={(e) => setDonationMessage(e.target.value)}
          />
        </div>
      </form>
      <button onClick={showRazorpay} className="btn btn-primary btn-block">
        Pay with razorpay
      </button>
    </div>
  );
}

export default App;
