<link href="./error.css" />

<div class="{$store.error ? css.erroron : css.error}">
    <pre>{$store.error ? $store.error.toString() : ""}</pre>
</div>

<script>
import store from "./store.js";
</script>
