import React, { useEffect, useState } from 'react';
import service from './service.js';

function Task() {
  const [newTodo, setNewTodo] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [todos, setTodos] = useState([]);

  async function getTodos() {
    const todos = await service.getTasks();
    setTodos(todos);
  }
  const handleChange = (event) => {
    setIsChecked(event.target.checked); //עדכון מצב ה-checkbox אם הוא נבחר או לא
  };
  async function createTodo(e) {
    if(newTodo=="")
    {
      return
    }
    e.preventDefault();
    var task={name:newTodo,isComplete:isChecked}
    await service.addTask(task);
    setNewTodo("");//clear input
    setIsChecked(false)
    await getTodos();//refresh tasks list (in order to see the new one)
  }

  async function updateCompleted(todo, isComplete) {
    await service.setCompleted(todo.id, isComplete);
    await getTodos();//refresh tasks list (in order to see the updated one)
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos();//refresh tasks list
  }

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <form className="todo-form">
  <div className="form-row">
    <input
      type="checkbox"
      value="completed"
      checked={isChecked}
      onChange={handleChange}
    />
    <input
      className="new-todo"
      placeholder="Well, let's take on the day"
      value={newTodo}
      onChange={(e) => setNewTodo(e.target.value)}
    />
  </div>
  <button className="submit-btn" onClick={createTodo}>
    Complete
  </button>
</form>

      </header>
      <section className="main" style={{ display: "block" }}>
        <ul className="todo-list">
          {todos.map(todo => {
            return (
              <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
                <div className="view">
                  <input className="toggle" type="checkbox" defaultChecked={todo.isComplete} onChange={(e) => updateCompleted(todo, e.target.checked)} />
                  <label>{todo.name}</label>
                  <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section >
  );
}

export default Task;