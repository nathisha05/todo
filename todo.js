const mongoose = require("mongoose");
const readline = require("readline");

mongoose
  .connect("mongodb://localhost:27017/todoapp")
  .then(() => {
    console.log("Connected to MongoDB");
    show();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
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

async function loadTodos(filter = {}) {
  return await Todo.find(filter);
}

async function addTodo(text, status) {
  if (!text.trim()) {
    console.log("Task cannot be empty!");
    return;
  }
  await Todo.create({ text, status });
}
async function updateTodo(id, updates) {
  await Todo.findByIdAndUpdate(id, updates);
}
async function deleteTodo(id) {
  await Todo.findByIdAndDelete(id);
}
function show() {
  console.log("\nTODO App");
  console.log("1. View All Tasks");
  console.log("2. View Completed Tasks");
  console.log("3. View In Progress Tasks");
  console.log("4. Add Task");
  console.log("5. Edit Task");
  console.log("6. Delete Task");
  console.log("7. Change Status");
  console.log("8. Exit");

  rl.question("Choose an option: ", handleMenu);
}
async function handleMenu(choice) {
  try {
    switch (choice) {
      case "1":
        displayTasks(await loadTodos());
        break;

      case "2":
        displayTasks(await loadTodos({ status: "completed" }));
        break;

      case "3":
        displayTasks(await loadTodos({ status: "inprogress" }));
        break;

      case "4":
        rl.question("Enter task name: ", (text) => {
          rl.question(
            "Status (c for completed, ip for inprogress): ",
            async (status) => {
              const validStatus =
                status.toLowerCase() === "c" ? "completed" : "inprogress";

              await addTodo(text, validStatus);
              console.log("Task added successfully!");
              show();
            },
          );
        });
        return;

      case "5":
        await editTask();
        return;

      case "6":
        await deleteTask();
        return;

      case "7":
        await toggleStatus();
        return;

      case "8":
        console.log("Ended");
        rl.close();
        mongoose.connection.close();
        return;

      default:
        console.log("Invalid choice.");
    }

    show();
  } catch (err) {
    console.error("Error:", err);
    show();
  }
}

async function editTask() {
  const todos = await loadTodos();
  displayTasks(todos);

  rl.question("Enter task number to edit: ", (num) => {
    const index = parseInt(num) - 1;

    if (!todos[index]) {
      console.log("Invalid task number.");
      return show();
    }

    const id = todos[index]._id;

    rl.question("Enter new text: ", (newText) => {
      rl.question("Status ( i for inprogress/ c for completed): ", async (status) => {
        const validStatus =
          status.toLowerCase() === "c" ? "completed" : "inprogress";

        await updateTodo(id, { text: newText, status: validStatus });
        console.log("Task updated!");
        show();
      });
    });
  });
}
async function deleteTask() {
  const todos = await loadTodos();
  displayTasks(todos);

  rl.question("Enter task number to delete: ", async (num) => {
    const index = parseInt(num) - 1;

    if (!todos[index]) {
      console.log("Invalid task number.");
    } else {
      await deleteTodo(todos[index]._id);
      console.log("Task deleted!");
    }

    show();
  });
}
async function toggleStatus() {
  const todos = await loadTodos();
  displayTasks(todos);

  rl.question("Enter task number to change status: ", async (num) => {
    const index = parseInt(num) - 1;

    if (!todos[index]) {
      console.log("Invalid task number.");
    } else {
      const currentStatus = todos[index].status;
      const newStatus =
        currentStatus === "inprogress" ? "completed" : "inprogress";

      await updateTodo(todos[index]._id, { status: newStatus });
      console.log(`Task status changed to ${newStatus}!`);
    }

    show();
  });
}
function displayTasks(tasks) {
  if (!tasks.length) {
    console.log("No tasks available");
  } else {
    tasks.forEach((todo, index) => {
      const symbol = todo.status === "completed" ? "[✓]" : "[ ]";
      console.log(`${index + 1}. ${symbol} ${todo.text}`);
    });
    console.log(`Total tasks: ${tasks.length}`);
  }
}
