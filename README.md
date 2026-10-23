# HiCCR: Not All Tokens Should Be Treated Equally — Context Credits Reassignment

**NeurIPS 2026** · [Project Page](https://daryl-gsj.github.io/HiCCR/) · [Paper (PDF)](paper.pdf) · arXiv (coming soon) · Code (coming soon)

An official repository for our accepted paper in NeurIPS 2026, *Not All Tokens Should Be Treated Equally: Context Credits Reassignment*.

- We propose **HiCCR** (Hierarchical Context Credit Reassignment) to mitigate visual attention drift and text-favored gradient imbalance in multimodal RLVR by replacing uniform token credit with hierarchical context-aware credit reassignment.
- A token-level weight amplifies the advantage of visually grounded tokens; a trajectory-level weight upweights rollouts with stronger visual engagement. Both come from a lightweight intra-visual attention concentration score (< 3% overhead, no auxiliary model, no extra data).
- On ten multimodal reasoning benchmarks, HiCCR improves GRPO by **+7.99** AVG@8 on Qwen3-VL-4B and reaches **72.76%** AVG@8 with Qwen3-VL-8B.

This paper is cooperated with ByteDance TikTok. Due to company open-source regulations, we are trying to release the full materials as soon as possible.

## Citation

```bibtex
@inproceedings{gao2026hiccr,
  title     = {Not All Tokens Should Be Treated Equally: Context Credits Reassignment},
  author    = {Gao, Shujian and Wang, Yuan and Yan, Jiamei and Zhou, Penghao and Wang, Qinglei and Yan, Jiangtao and Wu, Zuxuan and Jiang, Yu-Gang},
  booktitle = {Advances in Neural Information Processing Systems},
  year      = {2026}
}
```
