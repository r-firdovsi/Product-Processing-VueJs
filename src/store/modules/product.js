import Vue from "vue";
import { router } from "../../router";

const state = {
    products : []
}

const getters = {
    getProducts(state) {
        return state.products;
    },
    getProduct(state) {
       return key => state.products.filter(element => {
            return element.key == key;
        })
    }
}

const mutations = {
    updateProductList(state, product) {
        state.products.push(product);
    }
}

const actions = {
    initApp({ commit }) {
        // Vue Resource Islemleri..
        Vue.http.get("https://urun-islemleri-74cb8.firebaseio.com/products.json")
        .then(response => {
            let data = response.body;
            for(let key in data) {
                data[key].key = key;
                commit("updateProductList", data[key])
            }
        })
    },
    saveProduct({ dispatch, commit, state }, product) {
        // Vue Resource Islemleri..
        Vue.http.post("https://urun-islemleri-74cb8.firebaseio.com/products.json", product)
        .then( (response) => {
            // Update product list
            product.key = response.body.name;
            commit("updateProductList", product);
            // Buy,Sell, Update Account Info
            let tradeResult = {
                purchase : product.price,
                sale : 0,
                count : product.count
            }
            dispatch("setTradeResult", tradeResult);
            router.replace("/");
        })
    },
    sellProduct({ commit, state, dispatch }, payLoad) {
        // Vue Resource Islemleri..
        // pass by refence
        // pass by value

        let product = state.products.filter(element => {
            return element.key == payLoad.key;
        })

        if(product) {

            let totalCount = product[0].count - payLoad.count;
            Vue.http.patch("https://urun-islemleri-74cb8.firebaseio.com/products/" + payLoad.key + ".json", { count : totalCount})
            .then(response => {
                product[0].count = totalCount;
                let tradeResult = {
                    purchase : 0,
                    sale : product[0].price,
                    count : payLoad.count
                }
                dispatch("setTradeResult", tradeResult);
                router.replace("/");
            })
        }

        
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}