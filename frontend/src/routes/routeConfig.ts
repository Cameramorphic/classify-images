import { RouteProps } from "react-router-dom";

import ClassifyRoute from "./ClassifyRoute";
import ErrorRoute from "./ErrorRoute";
import RootRoute from "./RootRoute";
import SearchImageRoute from "./SearchImageRoute";
import SearchVideoRoute from "./SearchVideoRoute";
import AboutRoute from "./AboutRoute";

interface IRoute extends RouteProps {
    title: string;
    mainPage?: boolean;
}

export const PATHS = {
    ROOT: '/',
    CATEGORISE: '/categorise',
    SEARCH_VIDEO: '/search-video',
    SEARCH_IMAGES: '/search-images',
    ABOUT: '/about',
    ERROR: '/404'
}

export const routes: IRoute[] = [
    {
        title: 'AI powered image classification',
        mainPage: true,
        path: PATHS.ROOT,
        component: RootRoute,
        exact: true
    },
    {
        title: 'Categorise Images',
        path: PATHS.CATEGORISE,
        component: ClassifyRoute
    },
    {
        title: 'Search Video',
        path: PATHS.SEARCH_VIDEO,
        component: SearchVideoRoute
    },
    {
        title: 'Search Images',
        path: PATHS.SEARCH_IMAGES,
        component: SearchImageRoute
    },
    {
        title: 'About',
        path: PATHS.ABOUT,
        component: AboutRoute
    },
    {
        title: '404 Error!',
        path: PATHS.ERROR,
        mainPage: true,
        component: ErrorRoute
    }
];
