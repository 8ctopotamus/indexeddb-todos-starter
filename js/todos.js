document.addEventListener('DOMContentLoaded', (e) => {

  let db
  const request = window.indexedDB.open('TodoList', 1)

  request.onerror = e => console.log(e.target.errorCode)

  request.onupgradeneeded = e => {
    const db = e.target.result
    db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true })
  }

  request.onsuccess = e => {
    // set global db to opened DB
    db = e.target.result
    console.log(`Successfully opened ${db.name}`)
    getTodos()
  }

  const getTodosTransactionStore = () => {
    const transaction = db.transaction(['todos'], 'readwrite')
    return transaction.objectStore('todos')
  }

  const form = document.getElementById('todo-form')
  const newTodoInput = document.querySelector('input.new-item')
  const todoListSpan = document.querySelector('.todo-container')

  const getTodos = () => {
    const store = getTodosTransactionStore()
    const getAllRequest = store.getAll()
    getAllRequest.onsuccess = e => {
      renderTodoList(getAllRequest.result)
    }
  }

  const renderTodoList = todos => {
    const todosHTML = todos.map(todo => {
      const completeClass = todo.complete ? 'line-through' : ''
      return `<li class="list-group-item todo-item">
        <span class="${completeClass}">${todo.text}</span>
        <input data-id="${todo.id}" type="text" class="edit" style="display: none;">
        <button data-id="${todo.id}" class="delete btn btn-danger">x</button>
        <button data-id="${todo.id}" data-complete="${todo.complete}" class="complete btn btn-primary">✓</button>
      </li>`
    }).join('')
    todoListSpan.innerHTML = todosHTML
  }

  form.addEventListener('submit', e => {
    e.preventDefault()
    const text = newTodoInput.value
    const store = getTodosTransactionStore()
    store.add({
      text,
      complete: false
    })
    newTodoInput.value = ''
    getTodos()
  })

  const deleteTodo = id => {
    const store = getTodosTransactionStore()
    store.delete(parseInt(id))
    getTodos()
  }

  const updateTodo = newTodo => {
    const store = getTodosTransactionStore()
    store.put(newTodo)
    getTodos()
  }

  todoListSpan.addEventListener('click', e => {
    const target = e.target
    const id = parseInt(target.getAttribute('data-id'))
    if (target.matches('.delete')) {
      deleteTodo(id)
    } else if (target.matches('.complete')) {
      const complete = JSON.parse(target.getAttribute('data-complete'))
      const text = e.target.previousElementSibling.previousElementSibling.previousElementSibling.innerText
      const newTodo = {
        id,
        complete: !complete,
        text,
      }
      updateTodo(newTodo)
    } else if (target.matches('span')) {
      const input = target.nextElementSibling
      input.value = target.innerText
      input.style.display = 'block'
      target.style.display = "none"
    }
  })

  todoListSpan.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      const complete = e.target.nextElementSibling.nextElementSibling.getAttribute('data-complete') === 'true'
      const newTodo = {
        id: parseInt(e.target.getAttribute('data-id')),
        text: e.target.value,
        complete,
      }      
      updateTodo(newTodo)
    }
  })

  todoListSpan.addEventListener('blur', e => {
    if (e.target.matches('input')) {
      const span = e.target.previousElementSibling
      e.target.value = span.innerText
      span.style.display = 'block'
      e.target.style.display = "none"
    }
  }, true)
});