# `screens.json` Specification

## Overview

`screens.json` is the intermediate document Navimint uses to represent analysis results as a screen list and transition graph.

This file serves both as the storage destination for AI analysis output and as the input used by the frontend to render `Sidebar`, `FlowGraph`, and `DetailPanel`.

## Root Structure

The root object of `screens.json` consists of the following four elements.

- `version`
- `project`
- `screens`
- `transitions`

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "baseURL": "http://localhost:5173"
  },
  "screens": [
    {
      "id": "welcome",
      "name": "WelcomePage",
      "route": "/",
      "description": "Entry point when no project is selected",
      "color": "#59C2D8"
    }
  ],
  "transitions": []
}
```

## Root Object

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | `string` | Required | Format version. The current value is `"1.0"` |
| `project` | `object` | Required | Project information |
| `screens` | `array` | Required | List of screens |
| `transitions` | `array` | Required | List of screen transitions |

## `version`

- Type: `string`
- Required
- Current expected value: `"1.0"`

The current implementation assumes `"1.0"`.

## `project`

`project` contains the basic information about the analyzed project.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | Required | Project name |
| `baseURL` | `string` | Required | Base URL used to generate screen preview URLs |

### Field Usage

- `project.name` is displayed as the project name
- `project.baseURL` is used together with `screens[].route` to generate screen preview URLs
- `project.baseURL` should be a base URL such as `http://localhost:5173`

## `screens`

`screens` is the list of screens. Each element represents one screen.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Required | Unique screen ID |
| `name` | `string` | Required | Screen name |
| `route` | `string` | Required | URL pattern |
| `description` | `string` | Optional | Screen description |
| `color` | `string` | Optional | Screen accent color |

### Field Usage

- `id` is referenced by `transitions[].from` and `transitions[].to`
- `name` is used in list views and graph node labels
- `route` is used for screen information display and for generating preview URLs together with `project.baseURL`
- `description` is used in detail views and search
- `color` is used as the accent color for screen nodes and list items

### `color` Handling

- `color` is optional
- If specified, a hexadecimal color code is recommended
- Even if an invalid value is provided, the app does not break and falls back to a default color

## `transitions`

`transitions` is a flat array of screen-to-screen transitions.

| Field | Type | Required | Description |
|---|---|---|---|
| `from` | `string` | Required | Source screen `id` |
| `to` | `string` | Required | Destination screen `id` |
| `trigger` | `string` | Optional | User action that triggers the transition |
| `condition` | `string` | Optional | Condition for the transition |

### Operational Notes

- `from` and `to` must refer to values that exist in `screens[].id`
- Transitions that reference non-existent `id` values are excluded from frontend rendering
- `trigger` and `condition` are used in detail views and edge information

## File Location

Place `screens.json` directly under the root of the opened project.

The app does not load an arbitrary JSON file path. It looks for `<rootDir>/screens.json` at a fixed location and writes back to the same path when saving.

## Minimum Valid Schema

The following is the minimum structure that works with the current Navimint implementation without breaking the UI.

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "baseURL": "http://localhost:5173"
  },
  "screens": [
    {
      "id": "welcome",
      "name": "WelcomePage",
      "route": "/",
      "description": "Entry screen",
      "color": "#59C2D8"
    }
  ],
  "transitions": []
}
```

## Operational Rules

- `screens[].id` must be unique
- `transitions[].from` and `transitions[].to` must reference existing `screens[].id` values
- `route` should be a meaningful URL pattern
- Dynamic segments such as `/users/:id` are allowed
- If `color` is specified, use a hexadecimal color code

## Summary

In the current implementation, the fields that actually affect `screens.json` are `version`, `project.name`, `project.baseURL`, the core fields of `screens`, and the reference fields in `transitions`.

If you generate JSON according to this specification, it can be used directly by the current Navimint screen list, transition graph, and detail views.
