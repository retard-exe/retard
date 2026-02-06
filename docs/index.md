---
layout: page
---

<script setup>
import { onBeforeMount } from 'vue'
import { useRouter } from 'vitepress'

const { go } = useRouter()

onBeforeMount(() => {
  go('/protocol/manifesto')
})
</script>

# REDIRECTING_TO_CORE...