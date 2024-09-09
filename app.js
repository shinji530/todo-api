import mongoose from "mongoose";
import express from "express";
import Task from "./models/Task.js";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB"));

const app = express();

const corsOption = {
    origin: ['http://127.0.0.1:3000'],
}

// middleware 모든 요청에 공통적으로 실행되는 코드
app.use(cors(corsOption));
app.use(express.json()); // 알아서 js 객체로 변환

// useAsync hook
function asyncHandler(handler) {
  // 함수를 인수로 받아서 함수를 반환한다.
  const newHandler = async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      console.log(e.name);
      console.log(e.message);
      if (e.name === "ValidationError") {
        res.status(400).send({ message: e.message });
      } else if (e.name === "CastError") {
        res.status(404).send({ message: "Cannot find given id." });
      } else {
        res.status(500).send({ message: e.message });
      }
    }
  };

  return newHandler;
}

app.post(
  `/tasks`,
  asyncHandler(async (req, res) => {
    // const newTask = req.body;
    // const ids = mockTasks.map((task) => task.id);
    // newTask.id = Math.max(...ids) + 1;
    // newTask.isComplete = false;
    // newTask.createdAt = new Date();
    // newTask.updatedAt = new Date();
    // mockTasks.push(newTask);
    // id 부여 로직을 짤 필요 없음
    const newTask = await Task.create(req.body);
    res.status(201).send(newTask);
  })
);

app.get(
  "/tasks",
  asyncHandler(async (req, res) => {
    // sort, count
    // const sort = req.query.sort;
    // const count = Number(req.query.count);

    // const compareFn =
    // sort === 'oldest'
    // ? (a, b) => a.createdAt - b.createdAt
    // : (a, b) => b.createdAt - a.createdAt;

    // let newTasks = mockTasks.sort(compareFn);

    // if (count) {
    //     newTasks = newTasks.slice(0, count);
    // }
    const sort = req.query.sort;
    const count = Number(req.query.count);
    const sortOption = { createdAt: sort === "oldest" ? "asc" : "desc" };
    const tasks = await Task.find().sort(sortOption).limit(count); // full scan
    res.send(tasks);
  })
);

app.get(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id; // mongoDB는 string으로 받음
    // const task = mockTasks.find((task) => task.id === id);
    const task = await Task.findById(id); // id string
    if (task) {
      res.send(task);
    } else {
      res.status(404).send({ message: "없습니다" });
    }
  })
);

// PUT은 전체를 업데이트, PATCH는 일부만 업데이트
app.patch(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id); // DB로부터 데이터를 가져왔다.
    // const task = mockTasks.find((task) => task.id === id);
    if (task) {
      Object.keys(req.body).forEach((key) => {
        task[key] = req.body[key]; // 해당 데이터를 수정
      }); // 이때 실제 DB에 반영되지는 않음
      await task.save(); // 서버에서 실제 DB에 반영
      // task.updatedAt = new Date();
      // 서버에서 res HTTP 응답을 클라이언트에 보내는 것
      res.send(task);
    } else {
      res.status(404).send({ message: "없습니다" });
    }
  })
);

app.delete(
  "/tasks/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findByIdAndDelete(id);
    // in memory 이므로 index는 배열의 index를 뜻함.
    // 해당 요소를 지우기 위해 splice 사용
    // const index = mockTasks.findIndex((task) => task.id === id);
    // 못 찾으면 -1 반환
    console.log("task", task);
    if (task) {
      // mockTasks.splice(index, 1);
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: "없습니다" });
    }
  })
);

app.listen(process.env.PORT, () => console.log("Server on"));
console.log("Hi");
