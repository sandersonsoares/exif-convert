import { ExifTool, ExifDateTime } from 'exiftool-vendored';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

async function convertImage(inputPath: string, folder: string) {
  if(path.extname(inputPath) === '.jpg') return inputPath;

  const outputPath = path.parse(inputPath).name + '.jpg';
  const fileOutputPath = path.join(folder, outputPath);

  await sharp(inputPath)
    .jpeg({ quality: 100 })
    .toFile(fileOutputPath);

  console.log('Imagem convertida com sucesso.', fileOutputPath);
  return fileOutputPath;
}

async function run(folderPath: string) {
  const exiftool = new ExifTool();

  try {
    // Lista todos os arquivos na pasta escolhida
    const files = await fs.readdir(folderPath);

    // Filtra apenas os arquivos de imagem (você pode ajustar essa condição conforme necessário)
    const imageFiles = files.filter((file) =>
      ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())
    );

    // Aqui você pode configurar os metatags a serem inseridos
    const defaultTags = {
      ModifyDate: ExifDateTime.now(),
      GPSVersionID: "2.2.0.0",
      GPSLatitudeRef: 'S',
      GPSLatitude: -7.121936599988794,
      GPSLongitudeRef: 'W',
      GPSLongitude: -36.7246845,
      GPSDateStamp: '2024:05:01',
      DateTimeOriginal: ExifDateTime.now(),
      CreateDate: ExifDateTime.now(),
    };

    // Atualiza as tags para cada arquivo de imagem
    for (const imageFile of imageFiles) {
      const imagePath = path.join(folderPath, imageFile);

      // converte a imagem em JPG
      const convertedImage = await convertImage(imagePath, folderPath);

      await exiftool.write(convertedImage, defaultTags);
      console.log(`Tags atualizadas para ${imageFile}`);
    }

  } catch (error) {
    console.error('Erro ao adicionar as tags:', error);
  } finally {
    // Fecha a instância do ExifTool
    if (exiftool) {
      await exiftool.end();
    }
  }
}

run(process.env.FOLDER_PATH ?? `input`);

