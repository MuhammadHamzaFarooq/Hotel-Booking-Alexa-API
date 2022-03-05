import Alexa, { SkillBuilders } from "ask-sdk-core";
import { ExpressAdapter } from "ask-sdk-express-adapter";
import morgan from "morgan";
import axios from "axios";
import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 8000;
app.use(morgan("dev"));

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Welcome, you can say Hello or Help. Which would you like to try? . This is Express Server";

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
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    const numberOfPeoples = slots.NumberOfPeople;
    console.log("NumberOfPeople " + NumberOfPeople);

    const roomType = slots.roomType;
    console.log("roomType " + roomType);

    const duration = slots.duration;
    console.log("duration " + duration);

    const arrivalDate = slots.arrivalDate;
    console.log(" arrivalDate " + arrivalDate);

    const speakOutput = "your hotel room booking is completed";

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

const SkillBuilder = SkillBuilders.custom()
  .addErrorHandlers(LaunchRequestHandler, bookRoomIntentHandler)
  .addErrorHandlers(ErrorHandler);

const skill = SkillBuilder.create();
const adapter = new ExpressAdapter(skill, false, false);

app.post("/api/v1/webhook-alexa", adapter.getRequestHandlers());

app.use(express.json());
app.use(cors());

app.get("/test",(req,res)=>{
    res.send("Alexa test Server")
});

app.get("/",(req,res)=>{
  res.send("Express Server form Alexa")
})

app.listen(PORT, () => {
  console.log(`Server is upon running on port ${PORT}`);
});
