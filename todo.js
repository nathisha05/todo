const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function loadTodos() {
  if (fs.existsSync("todos.json")) {
    const data = fs.readFileSync("todos.json");
    return JSON.parse(data);
  }
  return [];
}
function saveTodos(todos) {
  fs.writeFileSync("todos.json", JSON.stringify(todos, null, 2));
}


function show() {
  console.log("\nTODO App");
  console.log("1. View Tasks");
  console.log("2. Add Task");
  console.log("3. Edit Task");
  console.log("4. Delete Task");
  console.log("5. Complete Task");
  console.log("6. Exit");

  rl.question("Choose an option: ", handleMenu);
}
function handleMenu(choice) {
  let todos = loadTodos();

  switch (choice) {
    case "1":
      console.log("\nYour Tasks:");
      if (todos.length === 0) {
        console.log("No tasks available");
      } else {
        todos.forEach((todo, index) => {
          console.log(
            `${index + 1}. ${todo.completed ? "[✓]" : "[ ]"} ${todo.text}`,
          );
        });
      }
      show();
      break;

    case "2":
      rl.question("Enter new task: ", (task) => {
        todos.push({ text: task, completed: false });
        saveTodos(todos);
        console.log("Task added successfully!");
        show();
      });
      break;

    case "3":
      rl.question("Enter task number to edit: ", (num) => {
        const index = num - 1;
        if (todos[index]) {
          rl.question("Enter new text: ", (newText) => {
            todos[index].text = newText;
            saveTodos(todos);
            console.log("Task updated!");
            show();
          });
        } else {
          console.log("Invalid task number.");
          show();
        }
      });
      break;

    case "4":
      rl.question("Enter task number to delete: ", (num) => {
        const index = num - 1;
        if (todos[index]) {
          todos.splice(index, 1);
          saveTodos(todos);
          console.log("Task deleted!");
        } else {
          console.log("Invalid task number.");
        }
        show();
      });
      break;

    case "5":
      rl.question("Enter task number to complete: ", (num) => {
        const index = num - 1;
        if (todos[index]) {
          todos[index].completed = !todos[index].completed;
          saveTodos(todos);
          console.log("Task status updated!");
        } else {
          console.log("Invalid task number.");
        }
        show();
      });
      break;

    case "6":
      console.log("Done");
      rl.close();
      break;

    default:
      console.log("Invalid choice.");
      show();
  }
}


show();
