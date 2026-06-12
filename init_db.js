<!DOCTYPE html>
<html>

<head>
    <title>{{title}}</title>

    <!-- Bootstrap -->
    <link rel="stylesheet" href="/css/bootstrap.min.css">
    <script src="/js/bootstrap.bundle.min.js"></script>

    <!-- Flatpickr -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>

    {{#each css}}
    <link rel="stylesheet" href="{{this}}">
    {{/each}}
</head>

<body>
    {{{body}}}
    <script src="/js/common.js"></script>
    {{#each js}}
    <script src="{{this}}"></script>
    {{/each}}
</body>
</html>
