import { ethers } from "ethers";
import ABI from './ABI.json';
import type { Transaction } from "ethers";
import ResidentPage from "../pages/residents/ResidentPage";
import { doApiLogin } from "./ApiService";


const ADAPTER_ADDRESS = `${import.meta.env.VITE_ADAPTER_ADDRESS}`;

export const Profile = {
    RESIDENT: 0,
    COUNSELOR: 1,
    MANAGER: 2
} as const;

export type Profile = typeof Profile[keyof typeof Profile];

export type LoginResult = {
    account: string;
    profile: Profile;
    token: string;
};

export type Resident = {
    wallet: string;
    isCounselor: boolean;
    isManager: boolean;
    residence: number;
    nextPayment: number;
};

export function isManager(): boolean {
    const profile = localStorage.getItem("profile");
    return profile !== null && parseInt(profile) === Profile.MANAGER;
}

export function isResident(): boolean {
    const profile = localStorage.getItem("profile");
    return profile !== null && parseInt(profile) === Profile.RESIDENT;
}

function getProvider(): ethers.BrowserProvider {
    if (!window.ethereum) throw new Error("No Metamask found");
    return new ethers.BrowserProvider(window.ethereum);
}

function getContract(provider?: ethers.BrowserProvider): ethers.Contract {
    if (!provider) provider = getProvider();
    return new ethers.Contract(ADAPTER_ADDRESS, ABI, provider);
}

async function getContractSigner(provider?: ethers.BrowserProvider): Promise<ethers.Contract> {
    if (!provider) provider = getProvider();
    const signer = await provider.getSigner(localStorage.getItem("account") || undefined);
    return new ethers.Contract(ADAPTER_ADDRESS, ABI, signer);
}

function getProfile(): Profile {
    const profile = localStorage.getItem("profile") || "0";
    return Number(profile) as Profile;
}

export async function doLogin(): Promise<LoginResult> {
    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);

    if (!accounts || !accounts.length) throw new Error("Wallet not found/allowed");

    const contract = getContract(provider);
//    console.log(contract);
    const resident = await contract.getResident(accounts[0]) as Resident;

    let isManager = resident.isManager;

    if (!isManager && resident.residence > 0) {
        if (resident.isCounselor)
            localStorage.setItem("profile", `${Profile.COUNSELOR}`);
        else
            localStorage.setItem("profile", `${Profile.RESIDENT}`);
    } else if (!isManager && !resident.residence) {
        const manager = await contract.getManager() as string;
        isManager = accounts[0].toUpperCase() === manager.toUpperCase();
    }

    if (isManager)
        localStorage.setItem("profile", `${Profile.MANAGER}`);
    else if (localStorage.getItem("profile") === null)
        throw new Error("Unauthorized");

    localStorage.setItem("account", accounts[0]);

    const signer = await provider.getSigner();
    const timestamp = Date.now();
    const message = `Autheticacao para Banco Comunidade V1. Data: ${timestamp}`;

    console.log("📩 Mensagem a ser assinada:", message);

    const secret = await signer.signMessage(message);

    console.log("🔏 Assinatura gerada:", secret);

    

    //enviar secret pro backend
    const token = await doApiLogin(accounts[0], secret, timestamp);
    console.log(token);
    localStorage.setItem("token",token);
    //pegar token gerado pelo backend]


    console.log("📤 Enviando para backend:", {
        wallet: accounts[0],
        timestamp,
        secret
    });


    return {
        token,
        account: accounts[0],
        profile: Number(localStorage.getItem("profile")) as Profile
    };
}

export function doLogout() {
    localStorage.removeItem("account");
    localStorage.removeItem("profile");
    localStorage.removeItem("token");
}

export async function getAddress(): Promise<string> {
    const contract = getContract();
    return contract.getImplAddress();
}

export async function upgrade(address: string): Promise<Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");
    const contract = await getContractSigner();
    return contract.upgrade(address);
}

export async function addResident(wallet: string, residenceId: number): Promise<Transaction> {
    if (getProfile() === Profile.RESIDENT) throw new Error("You do not have permission");
    const contract = await getContractSigner();
    return contract.addResident(wallet, residenceId);
}

export type ResidentPage = {
    residents: Resident[];
    total: ethers.BigNumberish;
}


export async function getResidents(page: number = 1, pageSize: number = 10): Promise<ResidentPage> {
    const contract = getContract();
    const result = await contract.getResidents(page, pageSize) as ResidentPage;
    const residents = [...result.residents.filter(r => r.residence)].sort((a, b) => ethers.toNumber(a.residence - b.residence));
    return{
        residents,
        total: result.total
    } as ResidentPage;
}

export async function getResident(wallet: string): Promise<Resident> {
    const contract = getContract();
    return contract.getResident(wallet);
}


export async function removeResident(wallet: string): Promise<Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");
    const contract = await getContractSigner();
    return contract.removeResident(wallet);
}

export async function setCounselor(wallet: string, isEntering: boolean): Promise<Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");
    const contract = await getContractSigner();
    return contract.setCounselor(wallet, isEntering);
}


export const Category = {
    DECISION: 0,
    SPENT: 1,
    CHANGE_QUOTA: 2,
    CHANGE_MANAGER: 3
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export const Status = {
    IDLE: 0,
    VOTING: 1,
    APPROVED: 2,
    DENIED: 3,
    DELETED: 4,
    SPENT: 5
} as const;

export type Status = typeof Status[keyof typeof Status];


export type Topic = {
 title: string;
 description: string;
 category: Category;
 amount: ethers.BigNumberish;
 responsible: string;
 status?: Status;
 createdDate?: ethers.BigNumberish;
 startDate?: ethers.BigNumberish;
 endDate?: ethers.BigNumberish;   
}

export type TopicPage = {
    topics: Topic[];
    total: ethers.BigNumberish;
}


export async function getTopics(page: number = 1, pageSize: number = 10): Promise<TopicPage> {
    const contract = getContract();
    const result = await contract.getTopics(page, pageSize) as TopicPage;
    const topics = [...result.topics.filter(t => t.createdDate)];
    //.sort((a, b) => ethers.toNumber(a.residence - b.residence));
    return{
        topics,
        total: result.total
    } as TopicPage;
}

export async function getTopic(title: string): Promise<Topic> {
    const contract = getContract();
    return contract.getTopic(title);
}

export async function removeTopic(title: string): Promise<Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");
    const contract = await getContractSigner();
    return contract.removeTopic(title);
}