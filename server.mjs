import Alexa, { SkillBuilders } from "ask-sdk-core";
import { ExpressAdapter } from "ask-sdk-express-adapter";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import moment from "moment";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 6000;
const localURL = `mongodb://localhost:27017/alexa-hotel-booking-db`;

app.use(morgan("dev"));

// db Connections
mongoose
  .connect(localURL)
  .then(() => {
    console.log(`Database is successfully conntect`);
  })
  .catch((e) => {
    console.log(`Database is not conntected : ${e}`);
  });

const bookingSchema = new mongoose.Schema({
  NumberOfPeople: String,
  roomType: String,
  duration: Number,
  arrivalDate: String,
  createdOn: { type: Date, default: Date.now },
});

const bookingModel = new mongoose.model("bookingModel", bookingSchema);

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = `
                <speak>
                    <voice name="Justin">
                        <amazon:emotion name="excited" intensity="high">
                        <s>Hello And Welcome</s>
                        <s>I am hotel booking virtual assistant</s>
                        <s>So how can help you</s>
                        <s>If you want to book a room</s>
                        <s>So ask me</s>
                        <s>I want to book a room</s>
                        </amazon:emotion>
                    </voice>
               </speak>
                       `;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const bookRoomIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "bookRoom"
    );
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    console.log(slots);

    const NumberOfPeople = slots.NumberOfPeople;
    console.log("NumberOfPeople " + NumberOfPeople.value);

    const roomType = slots.roomType;
    console.log("roomType " + roomType.value);

    const duration = slots.duration;
    console.log("duration " + duration.value);

    const arrivalDate = slots.arrivalDate;
    console.log(" arrivalDate " + arrivalDate.value);

    let standard = ["ORDINARY","REGULAR","STANDARD","standard","regular","ordinary","normal"];
    let vip = ["HIGHI CLASS","BEST","PERMIUM","VIP","vip","premium","best","high class","luxury"];
    let economy = ["cheapest","CHEAP","BASIC","ECONOMY","economy","basic" ,"low budget" ,"lowcheap"];

    try {
      let saveDocument = await bookingModel.create({
        NumberOfPeople: NumberOfPeople.value,
        roomType: roomType.value,
        duration: duration.value,
        arrivalDate: arrivalDate.value,
      });

      if (!saveDocument) {
        console.log("Document Save in db successfull");
      } else {
        console.log("Document not Save in db");
      }
    } catch (error) {
      console.log("Something went wrong for saving documents in db : ", error);
    }
    const speakOutput = `${roomType.value} room for ${NumberOfPeople.value} person. You can stay for ${duration.value} days and you will comming on ${arrivalDate.value}. So your hotel booking is completed`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Sorry, I had trouble doing what you asked. Please try again.";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

let skillBuilder = SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler, bookRoomIntentHandler)
  .addErrorHandlers(ErrorHandler);

let skill = skillBuilder.create();

let adapter = new ExpressAdapter(skill, false, false);

app.post("/api/v1/alexa-webhook", adapter.getRequestHandlers());

app.use(express.json());
app.use(cors());

app.get("/alexa", (req, res) => {
  res.send("Welcome in alexa hotel booking app");
});

app.listen(PORT, () => {
  console.log(`Server is upon running on port ${PORT}`);
});
