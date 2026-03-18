
import axiosClient from './axios-client';

export interface PrivacySection {
    id: string;
    title: string;
    content: string | string[];
    isList: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export const getPrivacyPolicy = async (): Promise<PrivacySection[]> => {
    const { data } = await axiosClient.get('/privacy-policy');
    return data.data;
};
