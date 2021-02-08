# classify-images
Web app for classifying images with given tags.
This application consists of two docker containers (front- and backend).
The backend is implemented in Python and deploys OpenAi's CLIP model (https://github.com/openai/CLIP) to perform zero-shot file classification, video retrieval and image search.
The frontend is implemented TypeScript using React and packages like rsuite, axios and particles.js.
Further instructions on how to start each of the two docker containers are in the specific README.md of the respective packages.
