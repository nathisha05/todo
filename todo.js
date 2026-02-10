const express = require("express");
const mongoose = require("mongoose");
const readline = require("readline");

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/todoapp")
  .then(() => {
    console.log("Connected to MongoDB");
    showMenu();
  })
  .catch((err) => console.log(err));

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["inprogress", "completed"],
    default: "inprogress",
  },
});

const Todo = mongoose.model("Todo", todoSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showMenu() {
  console.log("\nTODO APP");
  console.log("1. Add Task");
  console.log("2. Edit Task");
  console.log("3. Complete Task");
  console.log("4. View All Tasks");
  console.log("5. View Completed Tasks");
  console.log("6. View Inprogress Tasks");
  console.log("7. Exit");

  rl.question("Choose option: ", handleChoice);
}

async function handleChoice(choice) {
  if (choice === "1") {
    rl.question("Enter task name: ", (text) => {
      rl.question(
        "Enter status (c for completed / ip for inprogress): ",
        async (statusInput) => {
          let status = "inprogress";

          if (statusInput.toLowerCase() === "c") {
            status = "completed";
          }

          await Todo.create({
            text: text,
            status: status,
          });

          console.log("Task added successfully!");
          showMenu();
        },
      );
    });
  } else if (choice === "2") {
    const todos = await Todo.find();
    display(todos);

    rl.question("Enter task number to edit: ", (num) => {
      const index = parseInt(num) - 1;

      if (!todos[index]) {
        console.log("Invalid number");
        return showMenu();
      }

      rl.question("Enter new text: ", async (newText) => {
        await Todo.findByIdAndUpdate(todos[index]._id, { text: newText });
        console.log("Task updated!");
        showMenu();
      });
    });
  } else if (choice === "3") {
    const todos = await Todo.find({ status: "inprogress" });
    display(todos);

    rl.question("Enter task number to mark completed: ", async (num) => {
      const index = parseInt(num) - 1;

      if (!todos[index]) {
        console.log("Invalid number");
      } else {
        await Todo.findByIdAndUpdate(todos[index]._id, { status: "completed" });
        console.log("Task marked completed!");
      }

      showMenu();
    });
  } else if (choice === "4") {
    const todos = await Todo.find();
    display(todos);
    showMenu();
  } else if (choice === "5") {
    const todos = await Todo.find({ status: "completed" });
    display(todos);
    showMenu();
  } else if (choice === "6") {
    const todos = await Todo.find({ status: "inprogress" });
    display(todos);
    showMenu();
  } else if (choice === "7") {
    console.log("Exited");
    rl.close();
    mongoose.connection.close();
    process.exit(0);
  } else {
    console.log("Invalid option");
    showMenu();
  }
}

function display(tasks) {
  if (tasks.length === 0) {
    console.log("No tasks found");
  } else {
    tasks.forEach((task, i) => {
      const symbol = task.status === "completed" ? "[✓]" : "[ ]";
      console.log(`${i + 1}. ${symbol} ${task.text}`);
    });
  }
}

app.listen(3000, () => {
  console.log("Express server running on port 3000");
});
