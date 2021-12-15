/**
 * README - Future Work (6/12/2001)
 *
 *  * Use list items with checkbox for items done
 *  * Randomise note colors for default note distinction
 *  * Save note across sessions - localStorage, file & cloud. ALlow export to csv file.
 *  * Sort by modified time, user criteria, drag'n'drop
 *  * Debounce text input
 *  * Allow simple formatting or markdown in textarea
 *  * Have user prefs: (delete note prompt disable, sort order, categories and more)
 *  * PWA features: App notifications (i.e. when an important task is nearing deadline)
 *  * New task status: done with collapsible sidebar as container
 */

/**
 *  Use list items with checkbox for items done
 *
 *  * Render list of items with own state
 *  * How to parse text input into a list and for that list to persist with state - some text symbol: * | -
 */

/***************************** GLOBALS ***************************/
const rce = React.createElement;

/***************************** Card - Atoms <-{ DomElement } ***************************/

const Icon = ({ className: e, ...c }) => rce("i", { className: `bi ${e}`, ...c });
const Title = ({ children: e }) => rce("h5", { className: "card-title pb-2" }, [...e]);
const Body = ({ children, className }) => rce("div", { className: `card-body ${className?className:''}` }, [...children]);
const Button = ({ className: e, children: c, ...a }) => rce("button", { className: `btn btn-sm ${e}`, type: "button", ...a }, [
      ...c,
    ]);
const Label = ({ className: e, children: c }) => rce("label", { className: e }, [...c]);
const TextArea = ({...rest}) => rce(
  'textarea',
  {
    className: 'form-control',
    minLength: 12,
    maxLength: 256,
    rows: 6,
    cols: 33,
    required: true,
    ...rest
  },
  []
);
const InputGroup = ({className, children}) => rce(
  'div',
  {
    className: `input-group ${className}`
  },
  [ ...children ]
);
const InputText = ({type, className, ...rest}) => rce(
  'input',
  {
    type,
    className,
    ...rest
  }
);


/***************************** Card - Molecules <-{ ...Atoms } ***************************/

const Card_NewNote = ({ onAddNote }) => rce(
  Card,
  {
    className: "d-flex justify-content-center",
  },
  [
    rce(
      'div', {
        className: 'card-new-note'
      },
      rce(React.Fragment, {}, [
        rce(
          Icon,
          {
            className: 'bi-plus-circle',
            onClick: () => onAddNote(),
            title: 'Add New Note'
          }
        ),
        rce(
          Label,
          {
            className: 'text-muted fs-4'
          },
          'New Note'
        )
      ])
    )
  ]
);

/***************************** Card: Organisms <-{ ...Molecules } ***************************/
/***************************** Stateful Components ***************************/

/**
 * DeleteButton - Present a confirmation before we trigger delete action
 */
class DeleteButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showConfirm: false,
    };
    this.showConfirm = this.showConfirm.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }
  showConfirm() {
    this.setState({
      showConfirm: !this.state.showConfirm
    });
  }
  handleDelete() {
    this.setState({
      showConfirm: false
    });
    this.props.onNoteDelete();
  }
  render() {
    if (this.state.showConfirm) {
      return rce(
        'div',
        {
          className: 'd-flex align-items-center flex-grow-1 justify-content-end'
        },
        [
          rce(
            Button,
            {
              onClick: this.handleDelete,
              className: 'btn-danger'
            },
            'Are you sure?'
          ),
          rce(
            Icon,
            {
              className: 'bi-trash',
              title: 'Delete Note',
              onClick: this.showConfirm
            }
          ),
        ]
      );
    }
    return rce(
      'div',
      {
        className: 'd-flex align-items-center flex-grow-1 justify-content-end'
      },
      [
        rce(
          Icon,
          {
            className: 'bi-trash',
            title: 'Delete Note',
            onClick: this.props.shouldShowConfirm ? this.showConfirm : this.handleDelete
          }
        )
      ]
    );
  }
};

/**
 * ColorPicker - Present a list of color swatches that set the note background color to
 */
class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      showPicker: 0
    };
    this.pickerTimer = null;
    this.handleShowPicker = this.handleShowPicker.bind(this);
    this.handlePickColor = this.handlePickColor.bind(this);
  }

  componentWillUnmount() {
    clearTimeout(this.pickerTimer);
  }

  handleShowPicker() {
    this.setState({
      showPicker: 1 - this.state.showPicker
    });
    this.pickerTimer = setTimeout(() => this.setState({ showPicker: 0 }), 5000);
  }

  handlePickColor(idx) {
    this.setState({
      showPicker: 1 - this.state.showPicker,
    });
    this.props.onNoteColorChange(this.props.note.id, this.props.palette[idx]);
  }

  render() {
    if (this.state.showPicker) {
      return rce(
        React.Fragment,
        {},
        [
         rce(
            Icon,
            {
              className: 'bi-circle-fill',
            }
          ),
          rce(
            'div',
            {
              className: 'color-picker position-absolute bg-white shadow',
            },
            this.props.palette.map(({name, color}, idx) => rce(
              Icon,
              {
                className: `bi-circle-fill${(name === this.props.activeColor.name ? ' active' : '')}`,
                title: `${name[0].toUpperCase()}${name.substring(1)}`,
                key: `swatch-${name}`,
                onClick: () => this.handlePickColor(idx),
                style: { color }
              })
            )
          )
        ]
      );
    }
    return rce(
      Icon,
      {
        className: 'bi-circle-fill',
        title: 'Change Note Color',
        onClick: this.handleShowPicker,
        style: { color: this.props.activeColor.color }
      }
    );
  }
};

/**
 * TODO: implement a checkbox for items worked on
 */

const Text = ({ content }) => rce("p", { className: "card-text" }, [content]);

class ListGroup extends React.Component {

  List = ({ children }) => rce("div", { className: "list-group list-group-flush" }, [...children]);
  ListItem = ({ children, classNames }) => rce("label", {
    className: ["list-group-item", ...classNames].join(' ')
  }, [...children]);
  Checkbox = ({ checked, onChange, ...otherProps }) => rce(
    "input",
    {
      className: "form-check-input me-2",
      type: "checkbox",
      onChange,
      checked,
      ...otherProps
    }
  );

  constructor(props) {
    super(props);
    const [ unchecked, checked ] = props.content.split(/\n/).reduce((accum, line, id) => {
        if(line.trim().length) {
          let symbol = "*", text = line;
          const match = line.match(/^ ?([\*|-]) ?(.+)/);
          if (match) {
            [, symbol, text] = match;
          }
          const checked = symbol === "*" ? 0 : symbol === "-" ? 1 : 0;
          accum[checked].push({
            id,
            checked: checked === 1,
            text
          });
        }
        return accum;
      }, [[] , []]);

    this.state = {
      items: [
        ...unchecked,
        ...checked
      ]
    };

    this.onCheckboxClick = this.onCheckboxClick.bind(this);
  }

  splitItemsUnChecked(items) {
    return items.reduce((accum, item) => {
      const index = item.checked ? 1 : 0;
      accum[index].push(item);
      return accum;
    }, [[], []]);
  }

  onCheckboxClick(itemId) {
    const index = this.state.items.findIndex(({id}) => id === itemId);
    const items = [ ...this.state.items ];
    items[index].checked = !items[index].checked;
    // split items into check/unchecked with unchecked at the last
    const [ unchecked, checked ] = this.splitItemsUnChecked(items);
    this.setState({
      items: [
        ...unchecked,
        ...checked
      ]
    });
    // should we push the change up the heirarchy to change the actual symbol in the text
  }

  render() {
    return rce(
      this.List,
      {},
      [
        ...this.state.items.map(({ id, text, checked }) => rce(
          this.ListItem,
          {
            classNames: checked ? [
              "text-decoration-line-through",
              "text-muted"
            ] : []
          },
          [
            rce(
              this.Checkbox,
              {
                onChange: () => this.onCheckboxClick(id),
                checked,
                key: `checkbox-${id}`
              },
            ),
            rce(
              React.Fragment,
              {},
              [
                text
              ]
            )
          ]
        ))
      ]
    );
  }
}

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: /^ ?[\*|-]/.test(props.content) ? 1 : 0
    };
  }
  render() {
    return rce(
      this.state.viewMode ? ListGroup : Text,
      {
        content: this.props.content
      },
      []
    );
  }
}

/**
 * Card - Main wrapping component with variable content (View, Edit and New)
 */
class Card extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: this.props.viewMode
    };
  }

  // Footer - View Note Actions
  Note_IconGroup = ({ onNoteEdit, onNoteDelete }) => rce(
    'div',
    {
      className: 'd-flex align-items-center icon-group'
    },
    [
      rce(
        ColorPicker,
        {
          onNoteColorChange: this.props.onNoteColorChange,
          palette: this.props.palette,
          activeColor: this.props.note.color,
          note: this.props.note
        }
      ),
      rce(
        Icon,
        {
          className: 'bi-pencil-square',
          title: 'Edit Note',
          onClick: onNoteEdit
        }
      ),
      rce(
        DeleteButton,
        {
          onNoteDelete,
          shouldShowConfirm: this.props.note.content.trim().length !== 0 ||
            !this.props.settings.regex.title.test(this.props.note.title)
        }
      )
    ]
  );

  // Footer - Edit Note Actions
  Note_ButtonGroup = ({ onNoteSave, onNoteCancel }) => rce(
    'div',
    {
      className: 'button-group'
    },
    [
      rce(
        Button,
        {
          className: 'btn-outline-danger',
          onClick: onNoteCancel
        },
        'Discard'
      ),
      rce(
        Button,
        {
          className: 'btn-success',
          onClick: onNoteSave
        },
        'Save'
      )
    ]
  );

  // Footer - 2 types for when in view and edit
  Footer = () => rce(
    "div",
    {
      className: "card-footer bg-white bg-opacity-50",
    },
    [
      rce(
        this.state.viewMode == 1 ? this.Note_IconGroup : this.Note_ButtonGroup,
        {
          onColorChange: this.props.onColorChange,
          onNoteDelete: () => this.props.onNoteDelete(this.props.note.id),
          onNoteSave: () => this.props.onNoteSave(this.props.note.id),
          onNoteEdit: this.props.onNoteEdit,
          onNoteCancel: this.props.onNoteCancel
        }
      )
    ]
  );

  render() {
    const components = [
      rce(
        Body,
        {
          className: this.props.className
        },
        [
          ...this.props.children
        ]
      )
    ];
    if (this.state.viewMode > 0) {
      components.push(
          rce(
            this.Footer,
            {}
          )
      );
    }
    return rce(
      "div",
      {
        className: "card card-note",
        style: {
          backgroundColor: this.props.note && // no optional chaining in this env
            this.props.note.color &&
            this.props.note.color.color || 'white'
        }
      },
      [
        ...components
      ]
    );
  }
}

/**
 * Card_Note - Our 2 State Edit/View Note component
 */
class Card_Note extends React.Component {
  constructor(props) {
    super(props);
    this.charLimits = {
      title: 48,
      content: 256
    };
    this.state = {
      viewMode: 1, // user switch between view/edit mode - default: view
      note: { ...props.note } // locally state stored changes to note
    };
    this.onNoteColorChange = this.onNoteColorChange.bind(this);
    this.onNoteCancel = this.onNoteCancel.bind(this);
    this.onNoteEdit = this.onNoteEdit.bind(this);
    this.onNoteSave = this.onNoteSave.bind(this);
    this.onNoteTitleChange = this.onNoteTitleChange.bind(this);
    this.onNoteTitleClick = this.onNoteTitleClick.bind(this);
    this.onNoteContentChange = this.onNoteContentChange.bind(this);
  }

  // props change on a deletion
  static getDerivedStateFromProps(props, state) {
    if (props.note.id !== state.note.id) {
      return {
        note: {
          ...props.note
        }
      }
    }
    return null;
  }

  onNoteColorChange(noteId, color) {
    this.setState({
      note: {
        ...this.state.note,
        color
      }
    });
    this.props.onNoteColorChange(noteId, color);
  }

  onNoteCancel() {
    this.setState({
      viewMode: 1,
      note: { ...this.props.note }
    });
  }

  onNoteSave() {
    this.setState({
      viewMode: 1,
      note: {
        ...this.state.note,
        modified: new Date().toISOString()
      }
    });
    this.props.onNoteSave(this.state.note)
  }

  onNoteEdit() {
    this.setState({
      viewMode: 2
    });
    // TODO: set all other note's edit mode off
  }

  onNoteTitleClick(e) {
    e.target.select();
  }

  onNoteTitleChange(e) {
    const { value: title } = e.target;
    if (title.length <= this.charLimits.title) {
      this.setState({
        note: {
          ...this.state.note,
          title
        }
      });
    }
  }

  onNoteContentChange(e) {
    const { value: content } = e.target;
    if (content.length <= this.charLimits.content) {
      this.setState({
        note: {
          ...this.state.note,
          content
        }
      });
    }
  }

  // Edit Note
  EditNote = ({ note, onNoteSave }) => rce(
    React.Fragment,
    {},
    [
      rce(
        InputGroup,
        {
          className: 'mb-3'
        },
        [
          rce(
            'span',
            {
              className: 'input-group-text'
            },
            'Title'
          ),
          rce(
            InputText,
            {
              type: "text",
              className: "form-control",
              maxLength: this.charLimits.title,
              pattern: "\w+",
              value: this.state.note.title,
              onChange: this.onNoteTitleChange,
              onClick: this.onNoteTitleClick
            }
          )
        ]
      ),
      rce(
        TextArea,
        {
          value: this.state.note.content,
          onChange: this.onNoteContentChange
        }
      ),
      rce(
        Label,
        {
          className: 'form-label fst-italic fw-lighter w-100 text-end mb-0'
        },
        `Chars Left: ${this.charLimits.content - this.state.note.content.length}`
      )
    ]
  );

  // View Note Card Wrapper - default mode
  Card_ViewNote = ({}) => {
    const components = [
      rce(
        Content, // should have bi-state display component
        {
          content: this.state.note.content
        },
        []
      )
    ];
    if (this.state.note.title.trim().length > 0) {
      components.unshift(
        rce(
          Title,
          {},
          this.state.note.title
        )
      );
    }
    return rce(
      Card,
      {
        settings: this.props.settings,
        note: this.props.note,
        palette: this.props.palette,
        onNoteColorChange: this.onNoteColorChange,
        onNoteDelete: this.props.onNoteDelete,
        onNoteEdit: this.onNoteEdit,
        viewMode: this.state.viewMode
      },
      [
        rce(
          React.Fragment,
          {
          },
          [
            ...components
          ]
        )
      ]
    );
  }

  // Edit Note Card Wrapper
  Card_EditNote = () => rce(
    Card,
    {
      note: this.props.note,
      onNoteSave: this.onNoteSave,
      onNoteCancel: this.onNoteCancel,
      viewMode: this.state.viewMode
    },
    [
      rce(
        this.EditNote,
        {}
      )
    ]
  );

  render() {
    // Switch view depending on mode
    if (this.state.viewMode === 2) {
      return rce(
        this.Card_EditNote,
        {}
      );
    } else {
      return rce(
        this.Card_ViewNote,
        {}
      );
    }
  }
}

/**
 * Card_Container - will iterate over notes and render a 2-state Card_Note forEach
 */
const Card_Container = ({
  settings,
  notes,
  todos,
  palette,
  onNoteColorChange,
  onNoteSave,
  onNoteDelete,
  onAddNote
}) => {
  const cardNotes = notes.map((note) => {
    return rce(
      Card_Note,
      {
        settings,
        note,
        palette,
        onNoteColorChange,
        onNoteSave,
        onNoteDelete,
      }
    );
  });
  // Add action to add a new note at the end
  cardNotes.push(
    rce(
      Card_NewNote,
      {
        onAddNote
      }
    )
  );
  return rce(
    'div',
    {
      className: 'row'
    },
    [
      ...cardNotes
    ]
  );
}

/**
 * Navbar - Title and New Note Button
 */
class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appName: 'Note Buddy'
    };
  }
  render() {
    return rce(
      'nav',
      {
        className: 'navbar navbar-dark bg-dark'
      },
      [
        rce(
          'div',
          {
            className: 'container-fluid'
          },
          [
            rce(
              'div',
              {
                className: 'd-flex'
              },
              [
                rce(
                  Icon,
                  {
                    className: 'bi-pencil-square fs-2 me-2'
                  }
                ),
                rce(
                  'span',
                  {
                    className: 'navbar-brand mb-0 h1'
                  },
                  `${this.state.appName}`
                )
              ]
            ),
            rce(
              Icon,
              {
                className: 'bi-plus-circle-fill fs-3',
                onClick: this.props.onAddNote,
                title: 'Add New Note'
              }
            )
          ]
        )
      ]
    );
  }
}


/***************************** App Root ***************************/

class App extends React.Component {
  constructor(props) {
    super(props);
    this.palette = [{name:"baby-powder",color:"#fffffcff"},{name:"light-pink",color:"#ffadadff"},{name:"deep-champagne",color:"#ffd6a5ff"},{name:"lemon-yellow-crayola",color:"#fdffb6ff"},{name:"tea-green",color:"#caffbfff"},{name:"celeste",color:"#9bf6ffff"},{name:"baby-blue-eyes",color:"#a0c4ffff"},{name:"maximum-blue-purple",color:"#bdb2ffff"},{name:"mauve",color:"#ffc6ffff"}];
    this.settings = {
      storage: {
        key: 'notes'
      },
      strings: {
        title: 'New Note '
      },
      regex: {
      },
      orderBy: {
        id: (a, b) => a['id'] - b['id'],
        modified: (a, b) => new Date(b['modified']).getTime() - new Date(a['modified']).getTime()
      }
    };
    this.settings.regex['title'] = new RegExp(`^${this.settings.strings.title}\\d+$`);
    this.state = {
      notes: {},
      todos: {} // a version of notes that is split into todo list types
    };
    this.getAllNotes = this.getAllNotes.bind(this);
    this.onNoteColorChange = this.onNoteColorChange.bind(this);
    this.onAddNote = this.onAddNote.bind(this);
    this.onNoteDelete = this.onNoteDelete.bind(this);
    this.onNoteSave = this.onNoteSave.bind(this);
    /*
    const [ unchecked, checked ] = props.content.split(/\n/).reduce((accum, line, id) => {
        if(line.trim().length) {
          let symbol = "*", text = line;
          const match = line.match(/^ ?([\*|-]) ?(.+)/);
          if (match) {
            [, symbol, text] = match;
          }
          const checked = symbol === "*" ? 0 : symbol === "-" ? 1 : 0;
          accum[checked].push({
            id,
            checked: checked === 1,
            text
          });
        }
        return accum;
      }, [[] , []]);
     */
  }

  componentDidMount() {
    const { key } = this.settings.storage;
    const items = localStorage.getItem(key);
    if (items && items.length) {
      this.setState({
        notes: JSON.parse(items).reduce((accum, {id, content, ...rest}) => {
          return {
            ...accum,
            [id]: {
              content: content.split(/\n/),
              ...rest
            }
          };
        }, {})
      });
    }
  }

  /**
   * just want to watch state changes here
   */
  shouldComponentUpdate(nextProps, nextState) {
    const { storage: { key }, regex: { title: titleRe } } = this.settings;
    const items = Object.keys(nextState[key]).map((id) => ({ id, ...nextState[key][id]}));
    if (items.length) {
      localStorage.setItem(key,
        JSON.stringify(
          items.reduce((accum, next) => {
            if (!titleRe.test(next.title) || next.content.length > 0) {
              accum.push(next);
            }
            return accum;
          }, [])
        )
      );
    }
    return true;
  }

  getAllNotes(orderBy) {
    const order = this.settings.orderBy[orderBy] || this.settings.orderBy['id'];
    const items = Object.keys(this.state.notes).map((id) => ({ id, ...this.state.notes[id]}));
    return items.sort(order);
  }

  // Main Note Actions - operating on list and react will re-render
  onNoteColorChange(noteId, color) {
    if (this.state.notes.hasOwnProperty(noteId)) {
      this.setState({
        notes: {
          ...this.state.notes,
          [noteId]: {
            ...this.state.notes[noteId],
            color
          }
        }
      });
    }
  }

  // TODO: Need to have the note item id live up at this level
  // instead of any hacky stuff like search in notes for a string match
  onNoteItemCheckboxChange(itemId, isChecked) {
  }

  onAddNote() {
    const newId = +Object.keys(this.state.notes).at(-1) + 1 || 1;
    const { title } = this.settings.strings;
    const color = this.palette[
      Math.floor(
        Math.random() * this.palette.length
      )
    ];
    this.setState({
      notes: {
        ...this.state.notes,
        [newId]: {
          title: `${title}${newId}`,
          content: '',
          modified: new Date().toISOString(),
          color
        }
      }
    });
  }

  onNoteDelete(noteId) {
    if (this.state.notes.hasOwnProperty(noteId)) {
      const notes = { ...this.state.notes };
      delete notes[noteId];
      this.setState({
        notes
      });
    }
  }

  onNoteSave(note) {
    const { id } = note;
    if (this.state.notes.hasOwnProperty(id)) {
      this.setState({
        notes: {
          ...this.state.notes,
          [id]: {
            ...note,
            modified: new Date().toISOString()
          }
        }
      });
    }
  }

  render() {
    return rce(
      'div',
      {},
      [
        rce(
          Navbar,
          {
            onAddNote: this.onAddNote
          }
        ),
        rce(
          'div',
          {
            className: 'container-fluid'
          },
          [
            rce(
              Card_Container,
              {
                settings: this.settings,
                palette: this.palette,
                notes: this.getAllNotes(),
                todos: this.state.todos,
                onNoteColorChange: this.onNoteColorChange,
                onNoteDelete: this.onNoteDelete,
                onNoteSave: this.onNoteSave,
                onAddNote: this.onAddNote
              }
            ),
          ]
        )
      ]
    );
  }
}
/**
 * Init React
 */
const reactRoot = document.querySelector('#App');
ReactDOM.render(rce(App), reactRoot);
