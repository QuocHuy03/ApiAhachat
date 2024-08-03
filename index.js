const express = require("express");
const bodyParser = require("body-parser");
const { getSheetData } = require("./sheets");
const validationSchemas = require("./validationSchemas");
const app = express();
const port = 3000;

app.use(bodyParser.json());

function transformQuestions(questions, genderValues) {
  return questions.map((question) => {
    if (question.QUESION.includes("{{gender}}")) {
      const quesionVariants = genderValues.map((gender) =>
        question.QUESION.replace("{{gender}}", gender)
      );
      return {
        STT: question.STT,
        QUESION: quesionVariants,
        REPLY: question.REPLY,
      };
    } else {
      return question;
    }
  });
}
function checkAndReturnTransformedQuestion(
  questionToCheck,
  questions,
  genderValues
) {
  const transformedQuestions = transformQuestions(questions, genderValues);
  const matchedQuestion = transformedQuestions.find((item) =>
    Array.isArray(item.QUESION)
      ? item.QUESION.includes(questionToCheck)
      : item.QUESION === questionToCheck
  );
  return matchedQuestion || false;
}

const validateInput = async (question, reply) => {
  const sheetId = "19XR8tZOI09FvWyEihNAgVvl53ZBgXPI7jvCpDHSRUV0";
  const range = "ahachat!A1:C100";
  const data = await getSheetData(sheetId, range);
  const headers = data[0];
  const rows = data.slice(1);

  const predefinedQuestions = rows.map((row) => {
    let obj = {};
    row.forEach((cell, index) => {
      obj[headers[index]] = cell;
    });
    return obj;
  });

  const genderValues = ["anh", "chị"];
  const match = checkAndReturnTransformedQuestion(
    question,
    predefinedQuestions,
    genderValues
  );
  if (!match) {
    return false;
  }

  if (match) {
    const STT = parseInt(match.STT);
    const schema = validationSchemas[STT];
    const normalizedReply = reply.toLowerCase();
    const acceptableReplies = match?.REPLY?.split(/\s*,\s*/).map((item) =>
      item.trim().toLowerCase()
    );

    if (schema) {
      const result = schema.validate({ reply: normalizedReply });
      if (result.error) {
        console.log("Validation error:", result.error.details || result.error);
        return false;
      }
      if (!acceptableReplies.includes("null")) {
        return acceptableReplies?.includes(normalizedReply);
      }
      return true;
    }

    return acceptableReplies?.includes(normalizedReply);
  }
  return false;
};

app.post("/validate-response", async (req, res) => {
  const { question, reply } = req.body;
  const isValid = await validateInput(question, reply);
  console.log(isValid);
  res.json({ valid: isValid });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
