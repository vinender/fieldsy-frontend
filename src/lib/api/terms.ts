
import axiosClient from './axios-client';

export interface Term {
    id: string;
    title: string;
    content: string | string[];
    isList: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export const getTerms = async (): Promise<Term[]> => {
    const { data } = await axiosClient.get('/terms');
    return data.data;
};
