'use strict'

import React from 'react'
import uuid from 'uuid'
import classNames from 'classnames'

var remote = require('electron').remote
var fs = remote.require('fs')

require('../styles/app')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.onChangeInput = this.onChangeInput.bind(this)
    this.onKeyDownInput = this.onKeyDownInput.bind(this)
    this.onClickCheckAll = this.onClickCheckAll.bind(this)
    this.onClickClearDone = this.onClickClearDone.bind(this)
    this.onClickDisplay = this.onClickDisplay.bind(this)
    this.onChangeCheckbox = this.onChangeCheckbox.bind(this)
    this.onDoubleClickLabel = this.onDoubleClickLabel.bind(this)
    this.onBlurInputEdit = this.onBlurInputEdit.bind(this)
    this.onKeyDownInputEdit = this.onKeyDownInputEdit.bind(this)
    this.onChangeInputEdit = this.onChangeInputEdit.bind(this)
    this.onClickDel = this.onClickDel.bind(this)
    this.state = {
      input: '',
      display: 'ALL',
      editing: '',
      editText: '',
      todos: []
    }
  }

  componentDidMount () {
    fs.readFile('./data.json', (error, data) => {
      if (error) return
      this.setState({ todos: JSON.parse(data) })
    })
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.editing && this.state.editing) {
      let node = this.refs['editField_' + this.state.editing]
      node.focus()
      node.setSelectionRange(node.value.length, node.value.length)
    }
  }

  onChangeInput (input) {
    this.setState({ input: input })
  }

  onKeyDownInput (event) {
    if (event.keyCode === 13) { // Enter
      event.preventDefault()
      if (this.state.input.trim() === '') return
      let todos = [].concat(this.state.todos)
      todos.push({
        id: uuid.v1(),
        title: event.target.value,
        complete: false
      })
      this.setState({ input: '', todos: todos }, this.saveFile)
    }
  }

  onClickCheckAll () {
    let checkedCnt = this.state.todos.filter((todo, index, array) => {
      return todo.complete
    }).length
    let complete = checkedCnt !== this.state.todos.length
    let todos = this.state.todos.map((todo) => {
      todo.complete = complete
      return todo
    })
    this.setState({ todos: todos }, this.saveFile)
  }

  onClickClearDone () {
    let todos = this.state.todos.filter((todo, index, array) => {
      return !todo.complete
    })
    this.setState({ todos: todos }, this.saveFile)
  }

  onClickDisplay (type) {
    this.setState({ display: type })
  }

  onChangeCheckbox (id) {
    let todos = [].concat(this.state.todos)
    todos.forEach((todo, index, array) => {
      if (todo.id === id) {
        todo.complete = !todo.complete
        return
      }
    })
    this.setState({ todos: todos }, this.saveFile)
  }

  onDoubleClickLabel (todo) {
    this.setState({ editing: todo.id })
    this.setState({ editText: todo.title })
  }

  onBlurInputEdit (event) {
    let val = this.state.editText.trim()
    if (val) {
      let todos = this.state.todos.map((todo) => {
        if (this.state.editing === todo.id) {
          todo.title = val
        }
        return todo
      })
      this.setState({ todos: todos, editing: null }, this.saveFile)
      this.setState({ editText: val })
    }
  }

  onKeyDownInputEdit (event, todo) {
    if (event.which === 27) { // Escape
      this.setState({ editText: todo.title, editing: null })
    } else if (event.which === 13) { // Enter
      this.onBlurInputEdit(event)
    }
  }

  onChangeInputEdit (event) {
    this.setState({ editText: event.target.value })
  }

  onClickDel (id) {
    let todos = this.state.todos.filter((todo, index, array) => {
      return todo.id !== id
    })
    this.setState({ todos: todos }, this.saveFile)
  }

  saveFile () {
    fs.writeFile('./data.json', JSON.stringify(this.state.todos))
  }

  render () {
    return (
      <div>
        <h1>todos</h1>
        <div>
          <input
            type='text'
            placeholder='What needs to be done?'
            value={this.state.input}
            onChange={(event) => this.onChangeInput(event.target.value)}
            onKeyDown={(event) => this.onKeyDownInput(event)} />
        </div>
        <div>
          {
            this.state.todos.filter((todo, index, array) => {
              return !todo.complete
            }).length
          } items left
        </div>
        <div>
          <button onClick={() => this.onClickCheckAll()}>#</button>
          {(
            this.state.todos.filter((todo, index, array) => {
              return todo.complete
            }).length > 0
              ? <button onClick={() => this.onClickClearDone()}>
                CLEAR DONE
              </button> : ''
          )}
        </div>
        <div>
          <button onClick={() => this.onClickDisplay('TODO')}>
            {(this.state.display === 'TODO') ? '*' : '' }
            TODO
          </button>
          <button onClick={() => this.onClickDisplay('DONE')}>
            {(this.state.display === 'DONE') ? '*' : '' }
            DONE
          </button>
          <button onClick={() => this.onClickDisplay('ALL')}>
            {(this.state.display === 'ALL') ? '*' : '' }
            ALL
          </button>
        </div>
        <div>
          {
            this.state.todos.map((todo) => {
              if (this.state.display === 'ALL' ||
                (this.state.display === 'DONE') === todo.complete) {
                return (
                  <div
                    key={todo.id}
                    className={classNames({'editing': this.state.editing === todo.id})}>
                    <div className='view'>
                      <input
                        type='checkbox'
                        checked={todo.complete}
                        onChange={() => this.onChangeCheckbox(todo.id)} />
                      <label
                        onDoubleClick={() => this.onDoubleClickLabel(todo)}>
                        {todo.title}
                      </label>
                      <button
                        onClick={() => this.onClickDel(todo.id)}>
                        x
                      </button>
                    </div>
                    <input
                      ref={'editField_' + todo.id }
                      className={ 'edit_' + todo.id }
                      value={this.state.editText}
                      onBlur={(event) => this.onBlurInputEdit(event)}
                      onKeyDown={(event) => this.onKeyDownInputEdit(event, todo)}
                      onChange={(event) => this.onChangeInputEdit(event)} />
                  </div>
                )
              }
            })
          }
        </div>
      </div>
    )
  }
}
