import express from 'express';
import { PrismaClient } from './generated/prisma/index.js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises'; 
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();

app.use(cors({
    origin: 'https://perfil-de-usuario-kjgw.vercel.app/'

}));
app.use('/public', express.static(path.join(__dirname, 'public')));



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, 'public', 'imagens');
        fs.mkdir(uploadDir, { recursive: true }).then(() => {
            cb(null, uploadDir);
        }).catch(err => {
            console.error("Erro ao criar diretório de upload:", err);
            cb(err);
        });
    },
    filename: function(req, file, cb) {
        cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });


async function ensureImageDirectoryExists() {
    try {
        const uploadDir = path.join(__dirname, 'public', 'imagens');
        await fs.mkdir(uploadDir, { recursive: true });
        console.log("Diretório 'public/imagens' verificado/criado.");
    } catch (error) {
        console.error("Erro ao garantir que o diretório de imagens exista:", error);
    }
}
ensureImageDirectoryExists();


app.post('/users', upload.single('imagem_perfil'), async (req, res) => {
    try {
        const { name, email, password, idade, rua, bairro, estado, biografia } = req.body;

        if (!name || !email || !password || !idade || !rua || !bairro || !estado) {
            return res.status(400).json({ msg: "Todos os campos obrigatórios devem ser preenchidos." });
        }

        const existingUser = await prisma.user.findUnique({ where: { email: email } });
        if (existingUser) {
            return res.status(409).json({ msg: "Email já cadastrado." });
        }

        let imageUrl = null;
        if (req.file) {
            const originalFilePath = req.file.path;
            try {
                await sharp(originalFilePath)
                    .resize(200, 200, {
                        fit: sharp.fit.cover,
                        withoutEnlargement: true
                    })
                    .toFormat('jpeg', { quality: 80 })
                    .toFile(originalFilePath + '.temp');

                await fs.unlink(originalFilePath); 
                await fs.rename(originalFilePath + '.temp', originalFilePath); 

                imageUrl = `public/imagens/${req.file.filename}`;
            } catch (sharpError) {
                console.error("Erro ao processar imagem com sharp no cadastro:", sharpError);
                await fs.unlink(originalFilePath).catch(err => console.error("Erro ao remover arquivo não processado:", err));
                
            }
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password,
                idade: parseInt(idade),
                rua,
                bairro,
                estado,
                biografia,
                imagem_perfil: imageUrl,
            },
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ msg: "Erro ao criar usuário." });
    }
});


app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error("Erro ao buscar usuários!", error);
        res.status(500).json({ msg: "Erro ao buscar usuários!" });
    }
});


app.put('/users/:email', upload.single('imagem_perfil'), async (req, res) => {
    try {
        const { email } = req.params;
        
        const { name, password, idade, rua, bairro, estado, biografia } = req.body;

        const dataToUpdate = {};
        if (name !== undefined) dataToUpdate.name = name;
        if (password !== undefined && password !== '') dataToUpdate.password = password; 
        if (idade !== undefined) dataToUpdate.idade = parseInt(idade);
        if (rua !== undefined) dataToUpdate.rua = rua;
        if (bairro !== undefined) dataToUpdate.bairro = bairro;
        if (estado !== undefined) dataToUpdate.estado = estado;
        if (biografia !== undefined) dataToUpdate.biografia = biografia;

        let newImagePath = null;
        let deleteOldImage = false;

     
        if (req.file) {
            newImagePath = `public/imagens/${req.file.filename}`;
            dataToUpdate.imagem_perfil = newImagePath; 
            deleteOldImage = true; 
        } else {
            
        }


        if (deleteOldImage) {
            const existingUser = await prisma.user.findUnique({ where: { email: email } });
            if (existingUser && existingUser.imagem_perfil) {
                const oldImagePathOnDisk = path.join(__dirname, existingUser.imagem_perfil);
                try {
                    await fs.access(oldImagePathOnDisk); 
                    await fs.unlink(oldImagePathOnDisk); 
                    console.log(`Imagem antiga ${oldImagePathOnDisk} deletada do disco.`);
                } catch (unlinkError) {
                    if (unlinkError.code === 'ENOENT') {
                        console.warn(`Imagem antiga ${oldImagePathOnDisk} não encontrada no disco para exclusão.`);
                    } else {
                        console.error(`Erro ao tentar deletar a imagem antiga ${oldImagePathOnDisk}:`, unlinkError);
                    }
                }
            }
        }


        if (req.file) {
            const originalFilePath = req.file.path;
            try {
                await sharp(originalFilePath)
                    .resize(200, 200, {
                        fit: sharp.fit.cover,
                        withoutEnlargement: true
                    })
                    .toFormat('jpeg', { quality: 80 })
                    .toFile(originalFilePath + '.temp');

                await fs.unlink(originalFilePath);
                await fs.rename(originalFilePath + '.temp', originalFilePath);
            } catch (sharpError) {
                console.error("Erro ao processar nova imagem com sharp durante a atualização:", sharpError);
                
                await fs.unlink(originalFilePath).catch(err => console.error("Erro ao remover arquivo não processado após falha do sharp:", err));
                delete dataToUpdate.imagem_perfil; 
            }
        }

        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: dataToUpdate
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erro ao atualizar o usuário!", error);
        if (error.code === 'P2025') {
            res.status(404).json({ msg: "Usuário não encontrado para atualização." });
        } else {
            res.status(500).json({ msg: "Erro ao atualizar o usuário!" });
        }
    }
});


app.delete('/users/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const userToDelete = await prisma.user.findUnique({ where: { email: email } });
        if (!userToDelete) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

       
        if (userToDelete.imagem_perfil) {
            const imagePath = path.join(__dirname, userToDelete.imagem_perfil);
            try {
                await fs.access(imagePath); 
                await fs.unlink(imagePath); 
                console.log(`Imagem ${imagePath} deletada do disco.`);
            } catch (unlinkError) {
                if (unlinkError.code === 'ENOENT') {
                    console.warn(`Imagem ${imagePath} não encontrada no disco para exclusão.`);
                } else {
                    console.error(`Erro ao tentar deletar a imagem ${imagePath}:`, unlinkError);
                }
            }
        }

        await prisma.user.delete({
            where: { email: email },
        });

        res.status(200).json({ msg: "Usuário excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir usuário!", error);
        res.status(500).json({ msg: "Erro ao excluir usuário!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});