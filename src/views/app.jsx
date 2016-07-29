'use strict'

import React from 'react'
import uuid from 'uuid'
import classNames from 'classnames'
import 'photon/dist/css/photon.css'

var remote = require('electron').remote
var fs = remote.require('fs')
const { dialog } = remote.require('electron')

require('../styles/app')

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.onClickImport = this.onClickImport.bind(this)
    this.onClickExport = this.onClickExport.bind(this)
    this.onChangeInput = this.onChangeInput.bind(this)
    this.onKeyDownInput = this.onKeyDownInput.bind(this)
    this.onClickDisplay = this.onClickDisplay.bind(this)
    this.onChangeCheckbox = this.onChangeCheckbox.bind(this)
    this.onDoubleClickLabel = this.onDoubleClickLabel.bind(this)
    this.onBlurInputEdit = this.onBlurInputEdit.bind(this)
    this.onKeyDownInputEdit = this.onKeyDownInputEdit.bind(this)
    this.onChangeInputEdit = this.onChangeInputEdit.bind(this)
    this.onClickDel = this.onClickDel.bind(this)
    this.onClose = this.onClose.bind(this)
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

  onClickImport () {
    dialog.showOpenDialog(
      {
        properties: ['openFile']
      },
      (filename) => {
        fs.readFile(filename, (error, data) => {
          if (error) return
          this.setState({ todos: JSON.parse(data) })
        })
      }
    )
  }

  onClickExport () {
    dialog.showSaveDialog(
      {

      },
      (filename) => {
        fs.writeFile(filename, JSON.stringify(this.state.todos))
      }
    )
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

  onClose () {
    let window = remote.getCurrentWindow()
    window.close()
  }

  saveFile () {
    fs.writeFile('./data.json', JSON.stringify(this.state.todos))
  }

  render () {
    return (
      <div>
        <header className={classNames('toolbar', 'toolbar-header')}>
          <h1 className='title'>todoapp</h1>
          <div className='toolbar-actions'>
            <div className={classNames('btn-group')}>
              <button
                className={classNames('btn btn-default', {'active': this.state.display === 'TODO'})}
                onClick={() => this.onClickDisplay('TODO')}>
                TODO
              </button>
              <button
                className={classNames('btn btn-default', {'active': this.state.display === 'DONE'})}
                onClick={() => this.onClickDisplay('DONE')}>
                DONE
              </button>
              <button
                className={classNames('btn btn-default', {'active': this.state.display === 'ALL'})}
                onClick={() => this.onClickDisplay('ALL')}>
                ALL
              </button>
            </div>
            <div className={classNames('btn-group')}>
              <button
                className={classNames('btn', 'btn-default')}
                onClick={() => this.onClickImport()}>
                <span className='icon icon-book-open'></span>
              </button>
              <button
                className={classNames('btn', 'btn-default')}
                onClick={() => this.onClickExport()}>
                <span className='icon icon-export'></span>
              </button>
            </div>
            <button
              className={classNames('btn', 'btn-default', 'pull-right')}
              onClick={() => this.onClose()}>
              <span className='icon icon-cancel'></span>
            </button>
          </div>
        </header>
        <div>
          <input
            className={classNames('input', 'form-control')}
            type='text'
            placeholder='What needs to be done?'
            value={this.state.input}
            onChange={(event) => this.onChangeInput(event.target.value)}
            onKeyDown={(event) => this.onKeyDownInput(event)} />
        </div>
        <div className={classNames('list')}>
          <ul className={classNames('list-group')}>
            {
              this.state.todos.map((todo) => {
                if (this.state.display === 'ALL' ||
                  (this.state.display === 'DONE') === todo.complete) {
                  return (
                    <li
                      key={todo.id}
                      className={classNames('list-group-item', {'editing': this.state.editing === todo.id})}>
                      <div className='view'>
                        <input
                          className={classNames('pull-left')}
                          type='checkbox'
                          checked={todo.complete}
                          onChange={() => this.onChangeCheckbox(todo.id)} />
                        <label
                          className='label'
                          onDoubleClick={() => this.onDoubleClickLabel(todo)}>
                          {todo.title}
                        </label>
                        <button
                          className={classNames('btn', 'btn-default', 'pull-right')}
                          onClick={() => this.onClickDel(todo.id)}>
                          <span className={classNames('icon', 'icon-trash')}></span>
                        </button>
                      </div>
                      <input
                        ref={'editField_' + todo.id}
                        className={'edit_' + todo.id}
                        value={this.state.editText}
                        onBlur={(event) => this.onBlurInputEdit(event)}
                        onKeyDown={(event) => this.onKeyDownInputEdit(event, todo)}
                        onChange={(event) => this.onChangeInputEdit(event)} />
                    </li>
                  )
                }
              })
            }
          </ul>
        </div>
        <footer className={classNames('toolbar', 'toolbar-footer')}>
          <div className={classNames('toolbar-actions')}>
            {
              this.state.todos.filter((todo, index, array) => {
                return !todo.complete
              }).length
            } items left
          </div>
        </footer>
      </div>
    )
  }
}
