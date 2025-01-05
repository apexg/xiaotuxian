import { baseURL } from "./http";

// 添加拦截器
export const httpInterceptor = {
    //拦截前触发
    invoke(options: UniApp.RequestOptions) {
        if (!options.url.startsWith('http')) {
            options.url = baseURL + options.url;
        }
        options.timeout = 10000;
        console.log(options);
    }
};
