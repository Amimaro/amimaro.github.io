<template>
  <div id="contact">
    <h2 v-show="emailVisibility">{{email}}</h2>
  </div>
</template>

<script>
export default {
  name: "contact",
  data() {
    return {
      email: "amir.zahlan@gmail.com",
      emailVisibility: false
    };
  },
  methods: {
    toggleEmail: function() {
      this.emailVisibility = !this.emailVisibility;
    }
  }
};
</script>

<style lang="scss">
#contact {
  padding-bottom: 2vw;
}
</style>
