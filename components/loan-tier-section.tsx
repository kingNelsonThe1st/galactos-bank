"use client";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle, Star } from "lucide-react";
import Link from "next/link";
import React from "react";

export type LoanTier = {
	name: string;
	info: string;
	apr: number;
	features: {
		text: string;
		tooltip?: string;
	}[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
};

interface LoanTierSectionProps extends React.ComponentProps<"div"> {
	tiers: LoanTier[];
	heading: string;
	description?: string;
}

export function LoanTierSection({
	tiers,
	heading,
	description,
	...props
}: LoanTierSectionProps) {
	return (
		<div
			className={cn(
				"flex w-full flex-col items-center justify-center space-y-7 p-4",
				props.className
			)}
			{...props}
		>
			<div className="mx-auto max-w-xl space-y-2">
				<h2 className="text-center font-bold text-2xl tracking-tight md:text-3xl lg:font-extrabold lg:text-4xl">
					{heading}
				</h2>
				{description && (
					<p className="text-center text-muted-foreground text-sm md:text-base">
						{description}
					</p>
				)}
			</div>

			<div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{tiers.map((tier) => (
					<LoanTierCard key={tier.name} tier={tier} />
				))}
			</div>
		</div>
	);
}

type LoanTierCardProps = React.ComponentProps<"div"> & {
	tier: LoanTier;
};

export function LoanTierCard({
	tier,
	className,
	...props
}: LoanTierCardProps) {
	return (
		<div
			className={cn(
				"relative flex w-full flex-col rounded-lg border shadow-sm",
				tier.highlighted && "scale-105 border-primary",
				className
			)}
			key={tier.name}
			{...props}
		>
			<div
				className={cn(
					"rounded-t-lg border-b p-4",
					tier.highlighted && "bg-card dark:bg-card/80"
				)}
			>
				<div className="absolute top-2 right-2 z-10 flex items-center gap-2">
					{tier.highlighted && (
						<p className="flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs">
							<Star className="h-3 w-3 fill-current" />
							Popular
						</p>
					)}
				</div>

				<div className="font-medium text-lg">{tier.name}</div>
				<h3 className="mt-2 mb-1 flex items-end gap-1">
					<span className="font-extrabold text-3xl">
						{tier.apr}%
					</span>
					<span className="text-muted-foreground text-sm">
						APR
					</span>
				</h3>
				<p className="font-normal text-muted-foreground text-sm">{tier.info}</p>
			</div>
			<div
				className={cn(
					"space-y-4 px-4 pt-6 pb-8 text-muted-foreground text-sm",
					tier.highlighted && "bg-muted/10"
				)}
			>
				{tier.features.map((feature, index) => (
					<div className="flex items-start gap-2" key={index}>
						<CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground" />
						<TooltipProvider>
							<Tooltip delayDuration={0}>
								<TooltipTrigger asChild>
									<p
										className={cn(feature.tooltip && "cursor-pointer border-b")}
									>
										{feature.text}
									</p>
								</TooltipTrigger>
								{feature.tooltip && (
									<TooltipContent>
										<p>{feature.tooltip}</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					</div>
				))}
			</div>
			<div
				className={cn(
					"mt-auto w-full rounded-b-lg border-t p-3",
					tier.highlighted && "bg-card dark:bg-card/80"
				)}
			>
				<Button
					asChild
					className="w-full"
					variant={tier.highlighted ? "default" : "outline"}
				>
					<Link href={tier.btn.href}>{tier.btn.text}</Link>
				</Button>
			</div>
		</div>
	);
}