"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    primaryText?: string;
    secondaryText?: string;
    variant?: "default" | "danger" | "success";
}

export const AlertModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    primaryText = "OK",
    secondaryText = "Cancel",
    variant = "default",
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={cn(
                                "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
                                variant === "default" && "bg-blue-100 text-blue-600",
                                variant === "danger" && "bg-red-100 text-red-600",
                                variant === "success" && "bg-green-100 text-green-600"
                            )}>
                                <AlertCircle size={24} />
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
                            <p className="mb-6 text-gray-600">{description}</p>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {secondaryText}
                                </button>
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        "flex-1 rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90",
                                        variant === "default" && "bg-black",
                                        variant === "danger" && "bg-red-600",
                                        variant === "success" && "bg-green-600"
                                    )}
                                >
                                    {primaryText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
