AkomaNtosoExtension = window.AkomaNtosoExtension || {};

/**
 * Constructor for the Extension.
 *
 * @constructor
 */
AkomaNtosoExtension.Extension = function(){
  sync.ext.Extension.call(this);
};
goog.inherits(AkomaNtosoExtension.Extension, sync.ext.Extension);

/**
 * Editor created callback.
 *
 * @param {sync.Editor} editor The currently created editor.
 */
AkomaNtosoExtension.Extension.prototype.editorCreated = function(editor) {
  goog.events.listen(editor, sync.api.Editor.EventTypes.ACTIONS_LOADED, function(e) {
    var actionsManager = editor.getActionsManager();

    var originalInsertTableAction = actionsManager.getActionById('insert.table');
    if (originalInsertTableAction) {
      var insertTableAction = new sync.actions.AkomanNtosoInsertTable(
        originalInsertTableAction,
        "ro.sync.ecss.extensions.commons.operations.InsertFragmentOperation",
        editor,
        [
          sync.actions.InsertTable.TableTypes.HTML
        ],
        [
          sync.actions.InsertTable.ColumnWidthTypes.PROPORTIONAL,
          sync.actions.InsertTable.ColumnWidthTypes.DYNAMIC,
          sync.actions.InsertTable.ColumnWidthTypes.FIXED
        ],
        'Caption');
      // Override action defined in Document Type Association with one that ask for table caption.
      actionsManager.registerAction('insert.table', insertTableAction);
    }


    addOldStyleTableActions(e.actionsConfiguration, editor);
  }, true);
};

/**
 * Adds old-style (selection-based actions to the current configuration.
 *
 * @param {object} actionsConfiguration The actions configuration.
 * @param {sync.api.Editor} editor The actions manager.
 */
function addOldStyleTableActions(actionsConfiguration, editor) {
  if (isFrameworkActions(actionsConfiguration)) {
    var join_action = [
      {"id": "table.join", "type": "action"}
    ];
    var split_action = [
      {"id": "table.split", "type": "action"}
    ];
    var row_actions = [
      {"id": "insert.table.row.above", "type": "action"},
      {"id": "insert.table.row.below", "type": "action"},
      {"id": "delete.table.row", "type": "action"}
    ];
    var column_actions = [
      {"id": "insert.table.column.before", "type": "action"},
      {"id": "insert.table.column.after", "type": "action"},
      {"id": "delete.table.column", "type": "action"}
    ];

    // Make table-related actions context-aware.
    [].concat(join_action, split_action, row_actions, column_actions).forEach(function(action) {
      sync.actions.TableAction.wrapTableAction(editor, action.id);
    });

    // Wrap the table split action
    var splitActionId = 'table.split';
    var originalSplitAction = editor.getActionsManager().getActionById(splitActionId);
    if (originalSplitAction) {
      var splitTableAction = new sync.actions.SplitTableCell(
        originalSplitAction,
        editor);
      editor.getActionsManager().registerAction(splitActionId, splitTableAction);
    }

    var contextualItems = actionsConfiguration.contextualItems;
    for (var i = 0; i < contextualItems.length; i++) {
      if (contextualItems[i].name === tr(msgs.TABLE_)) {
        var items = contextualItems[i].children;

        var row_actions_index = indexOfId(items, row_actions[2].id);
        goog.bind(items.splice, items, row_actions_index, 1).apply(items, row_actions);

        var column_actions_index = indexOfId(items, column_actions[2].id);
        goog.bind(items.splice, items, column_actions_index, 1).apply(items, column_actions);
        break;
      }
    }
  }
}

/**
 * @param {Array<{id:string}>} items The array of items.
 * @param {string} id The ID that we search for.
 * @return {number} The index of the element with the given ID.
 */
function indexOfId(items, id) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      return i;
    }
  }
  return -1;
}

/**
 * @param {object} actionsConfiguration The actions configuration.
 *
 * @return {boolean} true if the actions loaded come from the framework.
 */
function isFrameworkActions(actionsConfiguration) {
  var toolbars = actionsConfiguration.toolbars;
  for(var i = 0 ; i < toolbars.length; i++){
    if(toolbars[i].name !== "Builtin" && toolbars[i].name !== "Review") {
      return true;
    }
  }
  return false;
}

// Publish the extension.
sync.ext.Registry.extension = new AkomaNtosoExtension.Extension();

sync.actions.AkomanNtosoInsertTable = function(delegate, tableOpClassName, editor) {
  sync.actions.InsertTable.apply(this, arguments);
  this.editor = editor;
};
goog.inherits(sync.actions.AkomanNtosoInsertTable, sync.actions.InsertTable);

sync.actions.AkomanNtosoInsertTable.prototype.invokeOperation = function(tableType, opt_title, opt_callback) {
  if(opt_title && opt_title.includes('<')) {
    opt_title = opt_title.split("<").join("&lt;");
  }
  if(opt_title && opt_title.includes('>')) {
    opt_title = opt_title.split(">").join("&gt;");
  }
  if(opt_title && opt_title.includes('&')) {
    opt_title = opt_title.split("&").join("&amp;");
  }

  if (opt_title) {
    this.editor.getActionsManager().invokeOperation(
      "ro.sync.ecss.extensions.commons.operations.InsertFragmentOperation",
      {
        fragment: "<table xmlns=\"http://docs.oasis-open.org/legaldocml/ns/akn/3.0/WD17\"><caption>" + opt_title + "</caption><tr><td><p></p></td></tr><tr><td><p></p></td></tr></table>"
      }
    );
  }else {
    this.editor.getActionsManager().invokeOperation(
      "ro.sync.ecss.extensions.commons.operations.InsertFragmentOperation",
      {
        fragment: "<table xmlns=\"http://docs.oasis-open.org/legaldocml/ns/akn/3.0/WD17\"><tr><td><p></p></td></tr><tr><td><p></p></td></tr></table>"
      }
    );
  }
};
