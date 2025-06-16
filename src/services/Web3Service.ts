import { ethers } from "ethers";
import ABI from './ABI.json';
import type { Transaction } from "ethers";

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
