import platform 

import psutil
import torch

def check_hardware():
    """Check available system hardware for AI/ML models."""

    print("\n" + "=" * 50)
    print("Hardware Check")
    print("=" * 50)

    # System
    print(f"\nOperating System: {platform.system()}")
    print(f"Processor: {platform.processor()}")

    #CPU
    print(f"CPU Cores: {psutil.cpu_count(logical=True)}")

    # RAM
    ram = psutil.virtual_memory().total / (1024 ** 3)
    print(f"Total RAM: {ram:.2f} GB")

    #Pytorch
    if torch.cuda.is_available():
        print("\n CUDA is available. GPU details:")

        device = torch.device("cuda")
        gpu_name = torch.cuda.get_device_name(0)

        gpu_memory = (
            torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        )

        print(f"Device: {device}")
        print(f"GPU: {gpu_name}")
        print(f"GPU Memory: {gpu_memory:.2f} GB")
        print(f"CUDA Version: {torch.version.cuda}")

        return {
            "device": "cuda",
            "gpu_available": True,
            "gpu_name": gpu_name,
            "gpu_memory_gb": round(gpu_memory, 2),
        }

    else:
        print("\nGPU NOT DETECTED")
        print("Using CPU")

        return {
            "device": "cpu",
            "gpu_available": False,
        }

if __name__ == "__main__":
    hardware = check_hardware()
    print(hardware)