# GenUI Skills

## Missing Inputs Dialog

### Use When
- required input is missing
- user needs to choose from options
- a widget cannot be rendered yet

### Output Format

```json
{
  "component": "gen_ui",
  "title": "Select Stock",
  "data": {
    "type": "dialog",
    "dialog": {
      "title": "Select Stock",
      "description": "Choose a stock to analyze.",
      "options": [
        { "label": "Tesla", "value": "TSLA" },
        { "label": "Apple", "value": "AAPL" },
        { "label": "Nvidia", "value": "NVDA" }
      ]
    }
  }
}
```

### Rules

- Use this before chart widgets when the stock symbol is missing.
- Each option must include `label` and `value`.
- The selected value is emitted as a `gen-ui:dialog.select` action.

## Chart Widget

### Use When
- analytics
- graph
- trends
- metrics

### Engine
chartjs

### Output Format

```json
{
  "component": "widget",
  "title": "Tesla Stock",
  "data": {
    "widget": "chart",
    "engine": "chartjs",
    "props": {
      "title": "",
      "type": "line",
      "data": []
    }
  }
}
```

### Widget Schema

```json
{
  "widget": "chart",
  "engine": "chartjs",
  "props": {
    "title": "",
    "type": "line",
    "data": []
  }
}
```

### Rules

- Do not output HTML, JSX, React imports, script tags, or a full document.
- For iframe charts, `data.widget` must be the literal string `"chart"`.
- Put all chart content under `data.props`.
- Always use responsive charts
- Use smooth lines
- Dark mode friendly
