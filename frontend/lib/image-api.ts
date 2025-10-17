import axios from 'axios';

const imageApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

export interface UploadedImage {
  id: string;
  url: string;
}

export const uploadImages = async (
  postId: string,
  files: File[]
): Promise<UploadedImage[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const { data } = await imageApiClient.post<{ images: UploadedImage[] }>(
    `/images/upload/${postId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data.images;
};

export const getImagesByPostId = async (postId: string): Promise<UploadedImage[]> => {
  const { data } = await imageApiClient.get<UploadedImage[]>(`/images/post/${postId}`);
  return data;
};

export const deleteImage = async (imageId: string): Promise<void> => {
  await imageApiClient.delete(`/images/${imageId}`);
};
