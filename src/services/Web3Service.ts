import { ethers } from "ethers";
import ABI from './ABI.json';
import type { Transaction } from "ethers";
import ResidentPage from "../pages/residents/ResidentPage";

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

    return {
        account: accounts[0],
        profile: Number(localStorage.getItem("profile")) as Profile
    };
}

export function doLogout() {
    localStorage.removeItem("account");
    localStorage.removeItem("profile");
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
