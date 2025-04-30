<template>
    
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { PropType } from 'vue';

type Article = {
    id: string;
    image: string;
    title: string;
    content: string;
    width: number;
    height: number;
    left?: number;
    top?: number;
    loaded?: boolean;
    skeleton?: boolean,
    imageError?: boolean
};

type FetchFunction = (page: number, pageSize: number) => Promise<{ data: Article[] }>;

export default defineComponent({
    name: 'MasonryList',
    directives: {
        lazy: lazyLoadDirective
    },
    props: {
        title: {
            type: String,
            default: 5
        },
        info: {
            type: String,
            default: 20
        }, dataList: {
            type: Array,
            default: []
        }
    },
    setup(props) {
        const toPage = () => {

        }

        return {
            toPage,
        };
    }
});
</script>

<style scoped></style>