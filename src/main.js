import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/index";
import "./registerServiceWorker";

import Icon from "vue-awesome/components/Icon";
import "vue-awesome/icons";
import Octicon from "vue-octicon/components/Octicon.vue";
import "vue-octicon/icons";

Vue.config.productionTip = false;

Vue.component("icon", Icon);
Vue.component("octicon", Octicon);

require("./main.scss");

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
