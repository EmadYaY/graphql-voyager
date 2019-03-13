import * as _ from 'lodash';

import * as ActionTypes from '../actions/';

import { extractTypeId } from '../introspection';

export type DisplayOptions = {
  rootTypeId?: string;
  skipRelay: boolean;
  sortByAlphabet: boolean;
  showLeafFields: boolean;
  hideRoot: boolean;
};

export type StateInterface = {
  schema: any;
  displayOptions: DisplayOptions;
  selected: {
    currentNodeId: string | null;
    currentEdgeId: string | null;
    scalar: string | null;
  };
  graphView: {
    svg: string;
    focusedId: string | null;
  };
  errorMessage: string | null;
};

const initialState: StateInterface = {
  schema: null,
  displayOptions: {
    rootTypeId: undefined,
    skipRelay: true,
    sortByAlphabet: false,
    showLeafFields: true,
    hideRoot: false,
  },
  selected: {
    currentNodeId: null,
    currentEdgeId: null,
    scalar: null,
  },
  graphView: {
    svg: null,
    focusedId: null,
  },
  errorMessage: null,
};

export function rootReducer(previousState = initialState, action) {
  const { type } = action;
  switch (type) {
    case ActionTypes.CHANGE_SCHEMA:
      return {
        ...previousState,
        schema: action.payload.introspection,
        displayOptions: _.defaults(action.payload.displayOptions, initialState.displayOptions),
        graphView: initialState.graphView,
        selected: initialState.selected,
      };
    case ActionTypes.CHANGE_DISPLAY_OPTIONS:
      let displayOptions = {
        ...previousState.displayOptions,
        ...action.payload,
      };
      return {
        ...previousState,
        displayOptions,
        graphView: initialState.graphView,
        selected: initialState.selected,
      };
    case ActionTypes.SVG_RENDERING_FINISHED:
      return {
        ...previousState,
        graphView: {
          ...previousState.graphView,
          svg: action.payload,
        },
      };
    case ActionTypes.SELECT_NODE:
      const currentNodeId = action.payload;
      if (currentNodeId === previousState.selected.currentNodeId) return previousState;

      return {
        ...previousState,
        selected: {
          ...previousState.selected,
          currentNodeId,
          currentEdgeId: null,
          scalar: null,
        },
      };
    case ActionTypes.SELECT_EDGE:
      let currentEdgeId = action.payload;

      // deselect if click again
      if (currentEdgeId === previousState.selected.currentEdgeId) {
        return {
          ...previousState,
          selected: {
            ...previousState.selected,
            currentEdgeId: null,
            scalar: null,
          },
        };
      }

      let nodeId = extractTypeId(currentEdgeId);
      return {
        ...previousState,
        selected: {
          ...previousState.selected,
          currentNodeId: nodeId,
          currentEdgeId,
          scalar: null,
        },
      };
    case ActionTypes.CLEAR_SELECTION:
      return {
        ...previousState,
        selected: initialState.selected,
      };
    case ActionTypes.FOCUS_ELEMENT:
      return {
        ...previousState,
        graphView: {
          ...previousState.graphView,
          focusedId: action.payload,
        },
      };
    case ActionTypes.FOCUS_ELEMENT_DONE:
      if (previousState.graphView.focusedId !== action.payload) return previousState;

      return {
        ...previousState,
        graphView: {
          ...previousState.graphView,
          focusedId: null,
        },
      };
    case ActionTypes.REPORT_ERROR:
      return {
        ...previousState,
        errorMessage: action.payload,
      };
    case ActionTypes.CLEAR_ERROR:
      return {
        ...previousState,
        errorMessage: initialState.errorMessage,
      };
    case ActionTypes.CHANGE_SELECTED_TYPEINFO:
      return {
        ...previousState,
        selected: {
          ...previousState.selected,
          typeinfo: action.payload,
        },
      };
    default:
      return previousState;
  }
}
