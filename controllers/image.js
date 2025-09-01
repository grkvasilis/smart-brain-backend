const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

// const Clarifai = require("clarifai")
// console.log(Clarifai)

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 3a458a7fcc424c4f931f9dab29c48ea8");

const handleApiCall = (req, res) => {
  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: "grkvasilis", // <-- from your Clarifai account
        app_id: "smartbrain", // <-- from the app you created in Clarifai
      },
      model_id: "face-detection",
      version_id: "6dc7e46bc9124c5c8824be4822abe105",
      inputs: [
        {
          data: {
            image: { url: req.body.input },
          },
        },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        console.log("Error: " + err);
        return;
      }

      if (response.status.code !== 10000) {
        console.log(
          "Received failed status: " +
            response.status.description +
            "\n" +
            response.status.details
        );
        return;
      }

      console.log("Predicted concepts, with confidence values:");
      for (const c of response.outputs[0].data.concepts) {
        console.log(c.name + ": " + c.value);
      }
      res.json(response);
    }
  );
};

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json("unable to get entries"));
};

module.exports = { handleImage, handleApiCall };
