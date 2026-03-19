<template>
  <v-container fluid class="pa-0 pa-sm-2">
    <v-card class="mx-auto" :max-width="isMobile ? '100%' : '900'">
      <v-toolbar color="primary" density="compact">
        <v-toolbar-title :class="isMobile ? 'text-body-2' : ''">
          Confidential Document
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-btn
          icon="mdi-fullscreen"
          variant="text"
          @click="isFullscreen = true"
          title="View Fullscreen"
        ></v-btn>
      </v-toolbar>

      <v-card-text class="pdf-viewport" @contextmenu.prevent @dblclick="isFullscreen = true">
        <vue-pdf-embed :source="myDocument" :width="pdfWidth" class="pdf-render" />
        <div class="mobile-shield"></div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="isFullscreen" fullscreen transition="dialog-bottom-transition">
      <v-card color="#1a1a1a" class="d-flex flex-column">
        <v-toolbar color="surface" density="compact">
          <v-btn icon @click="isFullscreen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Full Screen View</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto bg-grey-darken-4" @contextmenu.prevent>
          <div class="pdf-relative-container">
            <div class="d-flex justify-center">
              <vue-pdf-embed :source="myDocument" :width="fullScreenWidth" />
            </div>

            <div class="scrollable-shield"></div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import VuePdfEmbed from 'vue-pdf-embed'
import myDocument from '@/assets/cod.pdf'

const isFullscreen = ref(false)
const { width, name } = useDisplay()

const isMobile = computed(() => ['xs', 'sm'].includes(name.value))

// Width for the inline preview card
const pdfWidth = computed(() => {
  if (isMobile.value) return width.value - 20
  return 800
})

// Width for the fullscreen mode
const fullScreenWidth = computed(() => {
  if (isMobile.value) return width.value
  return width.value > 1200 ? 1100 : width.value - 40
})
</script>

<style scoped>
.pdf-viewport {
  height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #444;
  position: relative;
  cursor: zoom-in; /* Cursor hint for double-click */
}

.pdf-render {
  display: block;
  margin: 0 auto;
}

/* Shield to prevent right-click/long-press save */
.mobile-shield {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background: rgba(0, 0, 0, 0);
}

/* Container must be relative so the shield can cover the ACTUAL height of the PDF */
.pdf-relative-container {
  position: relative;
  display: block;
  width: 100%;
}

/* This shield now sits on top of the PDF but allows 
   the container underneath to scroll 
*/
.scrollable-shield {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  background: rgba(0, 0, 0, 0);
  /* This is the magic: it blocks right-clicks/long-press 
     but lets the scroll gesture pass through to the parent */
  pointer-events: auto;
}

.pdf-viewport {
  height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #444;
  position: relative;
}

@media print {
  body {
    display: none !important;
  }
}
</style>
